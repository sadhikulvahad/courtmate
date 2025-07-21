import { Request, Response } from "express";
import { CreateCheckoutSessionUseCase } from "../../application/useCases/CreateCheckoutSessionUseCase";
import Stripe from "stripe";
import { BookSlot } from "../../application/useCases/Booking/BookSlot";
import { NotificationService } from "../../infrastructure/services/notificationService";
import { PaymentUsecase } from "../../application/useCases/PaymentUsecase";
import { PaymentProps } from "../../domain/types/EntityProps";
import { Types } from "mongoose";
import { CreateSubscriptionUseCase } from "../../application/useCases/subscription/CreateSubscriptionUsecase";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";



type BillingCycle = "monthly" | "yearly";

@injectable()
export class paymentController {
    constructor(
        @inject(TYPES.CreateCheckoutSessionUseCase) private createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
        @inject(TYPES.BookSlot) private bookSlot: BookSlot,
        @inject(TYPES.PaymentUseCase) private paymentUsecase: PaymentUsecase,
        @inject(TYPES.CreateSubscriptionUseCase) private createSubscriptionUseCase: CreateSubscriptionUseCase,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async createCheckoutSessionController(req: Request, res: Response) {
        try {
            const { advocateId, selectedSlotId } = req.body

            if (!advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'advocateId required' });
            }

            if (!selectedSlotId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'selectedSlotId required' });
            }

            const user = req.user as { id: string; role: string; name: string; email: string } | undefined;
            const url = await this.createCheckoutSessionUseCase.execute(user, advocateId, selectedSlotId);
            res.status(HttpStatus.OK).json({ url });
        } catch (err) {
            this.logger.error({ err })
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
                apiVersion: "2025-06-30.basil",
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
            this.logger.error("Error creating subscription checkout session:", { err })
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
            this.logger.error("Webhook signature verification failed:", { err: err.message })
            return res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            try {
                // const notificationRepo = new NotificationRepositoryImplements();
                // const notificationService = new NotificationService(notificationRepo, io);
                if (session.mode === "subscription") {
                    if (!session.metadata || !session.metadata.advocateId || !session.metadata.plan || !session.metadata.billingCycle || !session.metadata.userId) {
                        this.logger.error("Missing metadata in session:", { sessioId: session.id })
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

                    const subscription = await this.createSubscriptionUseCase.execute(subscriptionData);

                    await this.notificationService.sendNotification({
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

                    await this.paymentUsecase.execute(paymentData);
                } else {

                    if (!session.metadata || !session.metadata.advocate_id || !session.metadata.slotId || !session.metadata.user_id) {
                        this.logger.error("Missing metadata in session:", { err: session.id })
                        return res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid session metadata" });
                    }
                    // Existing logic for advocate booking
                    const booking = await this.bookSlot.execute(
                        session.metadata.advocate_id!,
                        session.metadata.slotId!,
                        session.metadata.user_id!,
                        session.metadata.user_name!,
                        "Booked via user interface",
                        user,
                        this.notificationService
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

                    await this.paymentUsecase.execute(bookingData);
                }
            } catch (error) {
                this.logger.error("Error processing webhook:", { error })
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Failed to process webhook" });
            }
        }

        res.status(HttpStatus.OK).json({ received: true });
    }
}
