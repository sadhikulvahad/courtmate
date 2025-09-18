


import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { User } from '../../domain/entities/User';
import Stripe from 'stripe';
import { Logger } from 'winston';
import { IWalletRepository } from 'domain/interfaces/WalletRepository';
import { IBookSlot } from 'application/interface/booking/BookSlotRepo';
import { ReturnDTO } from 'application/dto';

@injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor(
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.IWalletRepository) private _walletRepo: IWalletRepository,
        @inject(TYPES.IBookSlot) private _bookSlotRepo: IBookSlot
    ) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-07-30.basil" });
    }

    async createCheckoutSession(
        user: { id: string; name: string; role: string; email: string } | undefined,
        advocate: User | null,
        selectedSlotId: string,
        paymentMethod: "wallet" | "stripe" | "",
        caseId: string
    ): Promise<ReturnDTO> {
        try {
            if (paymentMethod === 'stripe') {
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
                        slotId: selectedSlotId,
                        caseId: caseId
                    }
                });
                if (!session.url) {
                    return { success: false, error: `Didn't get session URL` }
                }
                this.logger.info(`Checkout session created: ${session.id}`);
                return { url: session.url, id: session.id, success: true };
            }

            if (!user?.id) {
                return { success: false, error: `User ID required for wallet payment` }
            }

            const wallet = await this._walletRepo.getWalletById(user.id);
            if (!wallet) {
                return { success: false, error: `Wallet not found for user` }
            }

            if (wallet.wallet.balance < 100) {
                return { success: false, error: `Insufficient wallet balance` }
            }

            await this._walletRepo.debitAmount(wallet?.wallet?._id!.toString(), 100);

            this.logger.info(`Wallet payment successful for user ${user.id}, amount ${100}`);

            await this._bookSlotRepo.execute(
                advocate?.id!,
                selectedSlotId!,
                user.id!,
                user.name!,
                "Booked via user interface",
                user,
                caseId
            );

            return { url: `${process.env.REDIRECT_URL}/success/success`, id: "wallet_txn_" + Date.now(), success: true };

        } catch (error: unknown) {
            this.logger.error('Failed to create checkout session', { error });
            throw error;
        }
    }
}
