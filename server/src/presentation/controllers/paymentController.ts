import { Request, Response } from "express";
import { CreateCheckoutSessionUseCase } from "../../application/useCases/CreateCheckoutSessionUseCase";
import Stripe from "stripe";
import { BookSlot } from "../../application/useCases/Booking/BookSlot";
import { NotificationRepositoryImplements } from "../../infrastructure/dataBase/repositories/NotificationRepository";
import { NotificationService } from "../../infrastructure/services/notificationService";
import { PaymentUsecase } from "../../application/useCases/PaymentUsecase";
import { PaymentProps } from "../../domain/types/EntityProps";
import { Types } from "mongoose";

export class paymentController {
    constructor(
        private createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
        private BookSlot: BookSlot,
        private PaymentUsecase: PaymentUsecase
    ) { }

    async createCheckoutSessionController(req: Request, res: Response) {
        try {
            const { advocateId, selectedSlotId } = req.body
            const user = req.user as { id: string; role: string; name: string } | undefined;
            const url = await this.createCheckoutSessionUseCase.execute(user, advocateId, selectedSlotId); // Pass user if needed
            res.status(200).json({ url });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to create Stripe session' });
        }
    }

    async handleStripeWebhook(req: Request, res: Response) {

        const sig = req.headers["stripe-signature"]!;
        let event;
        const user = req.user as { id: string; role: string; name: string } | undefined;
        const io = req.app.get("io");
        try {
            event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (err: any) {
            console.error("Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // ✅ Payment success event
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            if (!session.metadata || !session.metadata.advocate_id || !session.metadata.slotId || !session.metadata.user_id) {
                console.error("Missing metadata in session:", session.id);
                return res.status(400).json({ error: "Invalid session metadata" });
            }

            try {
                const notificationRepo = new NotificationRepositoryImplements()
                const notificationService = new NotificationService(notificationRepo, io)
                const booking = await this.BookSlot.execute(
                    session?.metadata?.advocate_id!,
                    session?.metadata?.slotId!,
                    session?.metadata?.user_id!,
                    "Booked via user interface",
                    user,
                    notificationService
                )
                console.log(booking.id, " booking 1")
                console.log(session, 'session')
                const bookingData: PaymentProps = {
                    sessionId: session.id,
                    userId: new Types.ObjectId(session.metadata.user_id),
                    advocateId: new Types.ObjectId(session.metadata.advocate_id),
                    slotId: new Types.ObjectId(session.metadata.slotId),
                    bookId: booking.id,
                    amount: session.amount_total ? session.amount_total / 100 : 0, // Convert to currency
                    status: session.payment_status,
                };

                console.log(bookingData, 'bookingdata')

                const payment = await this.PaymentUsecase.execute(bookingData)

                console.log(payment, 'payment')

            } catch (error) {
                return res.status(500).json({ success: false, error: 'Failed to book slot' })
            }

        }

        res.status(200).json({ received: true });
    }
}
