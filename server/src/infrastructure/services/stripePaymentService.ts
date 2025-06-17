import Stripe from "stripe";
import { User } from "../../domain/entities/User";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2025-05-28.basil",
});

export class PaymentService {
    async createCheckoutSession(
        user: { id: string; name: string; role: string; email : string } | undefined,
        advocate: User | null, selectedSlotId : string
    ): Promise<{ url: string; id: string }> {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `Consultation with ${advocate?.name}`,
                            description: `Booking for ${user?.name || "Guest"}`,
                        },
                        unit_amount: 10000, // 100 INR in paisa
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.REDIRECT_URL}/success/${"success"}`,
            cancel_url: `${process.env.REDIRECT_URL}/cancel/${"fail"}`,
            // customer_name: user?.name ?? undefined,
            metadata: {
                user_id: user?.id || "guest",
                user_name: user?.name || "Guest User",
                advocate_id: advocate?.id || "unknown",
                advocate_name: advocate?.name ?? "unknown",
                slotId : selectedSlotId
            },
        });
        if (!session.url) throw new Error("Stripe session URL is missing");

        return {
            url: session.url,
            id: session.id,
        };
    }
}
