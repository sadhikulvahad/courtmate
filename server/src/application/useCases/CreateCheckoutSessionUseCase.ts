import { UserRepository } from "../../domain/interfaces/userRepository";
import { PaymentService } from "../../infrastructure/services/stripePaymentService";

export class CreateCheckoutSessionUseCase {
    constructor(
        private paymentService: PaymentService,
        private userRepository : UserRepository    
    ) {}

    async execute(user: {id: string, name: string, role: string; email: string} | undefined, advocateId : string, selectedSlotId: string) {
        const advocate = await this.userRepository.findById(advocateId)
        const sessionUrl = await this.paymentService.createCheckoutSession(user, advocate, selectedSlotId);
        return sessionUrl;
    }
}
