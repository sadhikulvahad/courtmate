import { formToJSON } from "axios";
import { SlotRepository } from "../../domain/interfaces/SlotRepository";
import { UserRepository } from "../../domain/interfaces/UserRepository";
import { PaymentService } from "../../infrastructure/services/stripePaymentService";
import { error } from "console";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


@injectable()
export class CreateCheckoutSessionUseCase {
    constructor(
        @inject(TYPES.PaymentService) private paymentService: PaymentService,
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.SlotRepository) private slotRepository: SlotRepository,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async execute(user: { id: string, name: string, role: string; email: string } | undefined, advocateId: string, selectedSlotId: string) {
        const advocate = await this.userRepository.findById(advocateId)
        const slots = await this.slotRepository.getAvailableSlots(advocateId)

        const selectedSlot = slots.find((slot) => slot.id === selectedSlotId)

        if (!selectedSlot || !selectedSlot.isAvailable) {
            this.logger.error('This slot is already booked by someone')
            throw error('This slot is already booked by someone')
        }

        const sessionUrl = await this.paymentService.createCheckoutSession(user, advocate, selectedSlotId);
        return sessionUrl;
    }
}
