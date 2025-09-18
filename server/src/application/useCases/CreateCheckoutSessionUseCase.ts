import { formToJSON } from "axios";
import { ISlotRepository } from "../../domain/interfaces/SlotRepository";
import { IUserRepository } from "../../domain/interfaces/UserRepository";
import { PaymentService } from "../../infrastructure/services/stripePaymentService";
import { error } from "console";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";
import { ICreateCheckoutSessionUsecase } from "../../application/interface/CreateCheckoutSessionUsecaseRepo";
import { ICaseRepository } from "domain/interfaces/CaseRepository";
import { ReturnDTO } from "application/dto";


@injectable()
export class CreateCheckoutSessionUseCase implements ICreateCheckoutSessionUsecase {
    constructor(
        @inject(TYPES.PaymentService) private _paymentService: PaymentService,
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository,
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async execute(
        user: { id: string, name: string, role: string; email: string } | undefined,
        advocateId: string,
        selectedSlotId: string,
        paymentMethod: "wallet" | "stripe" | "",
        bookingType: "followup" | "new" | "",
        caseId: string
    ): Promise<ReturnDTO> {
        const advocate = await this._userRepository.findById(advocateId)
        const slots = await this._slotRepository.getAvailableSlots(advocateId)

        const selectedSlot = slots.find((slot) => slot.id === selectedSlotId)

        if (!selectedSlot || !selectedSlot.isAvailable) {
            this._logger.error('This slot is already booked by someone')
            throw new Error('This slot is already booked by someone')
        }

        if (!paymentMethod) {
            throw new Error('Payment Method is missing')
        }

        if (!bookingType) {
            throw new Error('Booking Type is missing')
        }

        if (bookingType === 'followup') {
            if (!caseId) {
                throw new Error('CaseId is missing')
            }

            const caseRecord = await this._caseRepository.findByCaseId(caseId)

            if (!caseRecord) {
                throw new Error('No case with this Id')
            }

        }


        const sessionUrl = await this._paymentService.createCheckoutSession(
            user,
            advocate,
            selectedSlotId,
            paymentMethod,
            caseId
        );

        return sessionUrl
    }
}
