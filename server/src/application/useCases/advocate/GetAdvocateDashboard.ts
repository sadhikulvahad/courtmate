import { Types } from "mongoose";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { IReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { ISlotRepository } from "../../../domain/interfaces/SlotRepository";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { INotificationRepository } from "../../../domain/interfaces/NotificationRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { AdvocateDashboardDTO } from "../../../application/dto";
import { IGetAdvocateDashboard } from "../../../application/interface/advocate/GetAdvocateDashboardRepo";


@injectable()
export class GetAdvocateDashboard implements IGetAdvocateDashboard {
    constructor(
        @inject(TYPES.IBookingRepository) private _bookRepositoty: IBookingRepository,
        @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository,
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepository,
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository,
        @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository
    ) { }

    async execute(advocateId: string): Promise<AdvocateDashboardDTO> {
        const totalBookings = await this._bookRepositoty.findByAdvocateId(advocateId)
        const availableSlots = await this._slotRepository.getAvailableSlots(advocateId)
        const reviews = await this._reviewRepository.getReviewsByAdvocateId(new Types.ObjectId(advocateId))
        const totalCases = await this._caseRepository.findAll(advocateId)
        const notification = await this._notificationRepository.findByRecieverId(advocateId)

        const DashboardData: AdvocateDashboardDTO = {
            totalBooking: totalBookings.map((b) => b.toJSON()),
            availableSlots: availableSlots,
            reviews,
            cases: totalCases,
            notifications: notification
        };

        return DashboardData
    }
}