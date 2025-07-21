


import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { User } from '../../domain/entities/User';
import Stripe from 'stripe';
import { Logger } from 'winston';

type StripeConfig = {
    secret: string;
    apiVersion: string;
};

@injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor(
        @inject(TYPES.Logger) private logger: Logger
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-06-30.basil" });
    }

    async createCheckoutSession(
        user: { id: string; name: string; role: string; email: string } | undefined,
        advocate: User | null,
        selectedSlotId: string
    ): Promise<{ url: string; id: string }> {
        try {
            this.logger.info(`Creating checkout session for user ${user?.id || 'guest'}`);
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: `Consultation with ${advocate?.name}`,
                                description: `Booking for ${user?.name || 'Guest'}`
                            },
                            unit_amount: 10000
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `${process.env.REDIRECT_URL}/success/success`,
                cancel_url: `${process.env.REDIRECT_URL}/cancel/fail`,
                metadata: {
                    user_id: user?.id || 'guest',
                    user_name: user?.name || 'Guest User',
                    advocate_id: advocate?.id || 'unknown',
                    advocate_name: advocate?.name || 'unknown',
                    slotId: selectedSlotId
                }
            });
            if (!session.url) throw new Error('Stripe session URL is missing');
            this.logger.info(`Checkout session created: ${session.id}`);
            return { url: session.url, id: session.id };
        } catch (error: unknown) {
            this.logger.error('Failed to create checkout session', { error });
            throw error;
        }
    }
}
