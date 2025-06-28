import { formToJSON } from "axios";
import { SlotRepository } from "../../domain/interfaces/SlotRepository";
import { UserRepository } from "../../domain/interfaces/userRepository";
import { PaymentService } from "../../infrastructure/services/stripePaymentService";
import { error } from "console";

export class CreateCheckoutSessionUseCase {
    constructor(
        private paymentService: PaymentService,
        private userRepository: UserRepository,
        private slotRepository: SlotRepository
    ) { }

    async execute(user: { id: string, name: string, role: string; email: string } | undefined, advocateId: string, selectedSlotId: string) {
        const advocate = await this.userRepository.findById(advocateId)
        const slots = await this.slotRepository.getAvailableSlots(advocateId)

        const selectedSlot = slots.find((slot) => slot.id === selectedSlotId)

        if (!selectedSlot || !selectedSlot.isAvailable) {
            throw error('This slot is already booked by someone')
        }

        const sessionUrl = await this.paymentService.createCheckoutSession(user, advocate, selectedSlotId);
        return sessionUrl;
    }
}
