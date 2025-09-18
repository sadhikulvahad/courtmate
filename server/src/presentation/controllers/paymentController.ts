import { Request, Response } from "express";
import Stripe from "stripe";
import { NotificationService } from "../../infrastructure/services/notificationService";
import { PaymentProps } from "../../domain/types/EntityProps";
import { Types } from "mongoose";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";
import { ICreateCheckoutSessionUsecase } from "../../application/interface/CreateCheckoutSessionUsecaseRepo";
import { IBookSlot } from "../../application/interface/booking/BookSlotRepo";
import { IPaymentUsecase } from "../../application/interface/PaymentUsecaseRepo";
import { ICreateSubscriptionUsecase } from "../../application/interface/subscription/CreateSubscriptionUsecaseRepo";
import { ISlotRepository } from "../../domain/interfaces/SlotRepository";
import { IWalletRepository } from "../../domain/interfaces/WalletRepository";



type BillingCycle = "monthly" | "yearly";

@injectable()
export class paymentController {
    constructor(
        @inject(TYPES.ICreateCheckoutSessionUseCase) private _createCheckoutSessionUseCase: ICreateCheckoutSessionUsecase,
        @inject(TYPES.IBookSlot) private _bookSlot: IBookSlot,
        @inject(TYPES.IPaymentUseCase) private _paymentUsecase: IPaymentUsecase,
        @inject(TYPES.ICreateSubscriptionUseCase) private _createSubscriptionUseCase: ICreateSubscriptionUsecase,
        @inject(TYPES.NotificationService) private _notificationService: NotificationService,
        @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository,
        @inject(TYPES.IWalletRepository) private _walletRepository: IWalletRepository,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async createCheckoutSessionController(req: Request, res: Response) {
        try {
            const { advocateId, selectedSlotId, paymentMethod, bookingType, caseId } = req.body

            if (!advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'advocateId required' });
            }

            if (!selectedSlotId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'selectedSlotId required' });
            }

            if (!paymentMethod) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Payment Method is not defined' });
            }

            if (!bookingType) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Booking Type is not defined' });
            }

            const user = req.user as { id: string; role: string; name: string; email: string } | undefined;
            const url = await this._createCheckoutSessionUseCase.execute(
                user,
                advocateId,
                selectedSlotId,
                paymentMethod,
                bookingType,
                caseId
            );

            res.status(HttpStatus.OK).json({ url });
        } catch (err) {
            this._logger.error({ err })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create Stripe session' });
        }
    }

    async createSubscriptionCheckoutSessionController(req: Request, res: Response) {
        try {
            const { advocateId, plan, price, billingCycle, nextBillingDate } = req.body;

            if (!advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'advocateId required' });
            }

            if (!plan) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'plan is required' });
            }

            const user = req.user as { id: string; role: string; name: string; email: string } | undefined;

            if (!user || user.id !== advocateId) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
            }

            if (!process.env.STRIPE_SECRET) {
                throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
            }

            // Map plan to Stripe price ID (you'll need to create these in your Stripe dashboard)
            const priceIds: Record<string, { monthly: string; yearly: string }> = {
                basic: {
                    monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!,
                    yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID!,
                },
                professional: {
                    monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!,
                    yearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID!,
                },
                enterprise: {
                    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
                    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID!,
                },
            };

            const stripe = new Stripe(process.env.STRIPE_SECRET!, {
                apiVersion: "2025-07-30.basil",
            });

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: priceIds[plan][billingCycle as BillingCycle],
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url: `${process.env.REDIRECT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.REDIRECT_URL}/subscription/cancel`,
                metadata: {
                    advocateId,
                    plan,
                    billingCycle,
                    userId: user.id,
                    userName: user.name,
                },
            });

            res.status(HttpStatus.OK).json({ url: session.url });
        } catch (err) {
            this._logger.error("Error creating subscription checkout session:", { err })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to create Stripe session" });
        }
    }

    async handleStripeWebhook(req: Request, res: Response) {
        const sig = req.headers["stripe-signature"]!;
        let event;
        const user = req.user as { id: string; role: string; name: string } | undefined;
        // const io = req.app.get("io");
        try {
            event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (err: any) {
            this._logger.error("Webhook signature verification failed:", { err: err.message })
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            try {
                if (session.mode === "subscription") {
                    if (!session.metadata || !session.metadata.advocateId || !session.metadata.plan || !session.metadata.billingCycle || !session.metadata.userId) {
                        this._logger.error("Missing metadata in session:", { sessioId: session.id })
                        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid session metadata" });
                    }

                    const nextBillingDate = new Date(
                        Date.now() +
                        (session.metadata.billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
                    );

                    const subscriptionData = {
                        advocateId: new Types.ObjectId(session.metadata.advocateId),
                        plan: session.metadata.plan as "basic" | "professional" | "enterprise",
                        billingCycle: session.metadata.billingCycle as "monthly" | "yearly",
                        price: session.amount_total ? session.amount_total / 100 : 0,
                        nextBillingDate,
                    };

                    const subscription = await this._createSubscriptionUseCase.execute(subscriptionData);

                    await this._notificationService.sendNotification({
                        senderId: new Types.ObjectId(session.metadata.advocateId),
                        recieverId: new Types.ObjectId(session.metadata.userId),
                        message: `Your ${subscriptionData.plan} subscription has been activated!`,
                        type: "Notification",
                        read: false,
                        createdAt: new Date(),
                    });

                    const paymentData: PaymentProps = {
                        sessionId: session.id,
                        userId: new Types.ObjectId(session.metadata.userId),
                        advocateId: new Types.ObjectId(session.metadata.advocateId),
                        slotId: new Types.ObjectId(),
                        bookId: "",
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        status: session.payment_status,
                    };

                    await this._paymentUsecase.execute(paymentData);
                } else {

                    if (!session.metadata || !session.metadata.advocate_id || !session.metadata.slotId || !session.metadata.user_id) {
                        this._logger.error("Missing metadata in session:", { err: session.id })
                        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid session metadata" });
                    }


                    const slot = await this._slotRepository.findById(session.metadata.slotId!)

                    if (slot?.status === 'confirmed' || slot?.isAvailable === false) {

                        const existingWallet = await this._walletRepository.getWalletById(session.metadata.user_id!)

                        let wallet;
                        if (existingWallet) {
                            wallet = existingWallet.wallet;
                        } else {
                            wallet = await this._walletRepository.createWallet(session.metadata.slotId!);
                        }
                        await this._walletRepository.creditAmount(wallet?._id!, 100);

                        return res.status(HttpStatus.CONFLICT).json({ error: "Slot already booked. Amount will be credited to your wallet." });
                    }

                    // Existing logic for advocate booking
                    const booking = await this._bookSlot.execute(
                        session.metadata.advocate_id!,
                        session.metadata.slotId!,
                        session.metadata.user_id!,
                        session.metadata.user_name!,
                        "Booked via user interface",
                        user,
                        session.metadata.caseId
                    );

                    const bookingData: PaymentProps = {
                        sessionId: session.id,
                        userId: new Types.ObjectId(session.metadata.user_id),
                        advocateId: new Types.ObjectId(session.metadata.advocate_id),
                        slotId: new Types.ObjectId(session.metadata.slotId),
                        bookId: booking.id,
                        amount: session.amount_total ? session.amount_total / 100 : 0,
                        status: session.payment_status,
                    };

                    await this._paymentUsecase.execute(bookingData);
                }
            } catch (error) {
                this._logger.error("Error processing webhook:", { error })
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Failed to process webhook" });
            }
        }

        res.status(HttpStatus.OK).json({ received: true });
    }
}
