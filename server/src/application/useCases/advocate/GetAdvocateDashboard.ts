import { Types } from "mongoose";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { ReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { NotificationRepository } from "../../../domain/interfaces/NotificationRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class GetAdvocateDashboard {
    constructor(
        @inject(TYPES.BookingRepository) private bookRepositoty: BookingRepository,
        @inject(TYPES.SlotRepository) private slotRepository: SlotRepository,
        @inject(TYPES.ReviewRepository) private reviewRepository: ReviewRepository,
        @inject(TYPES.CaseRepository) private caseRepository: CaseRepository,
        @inject(TYPES.NotificationRepository) private notificationRepository: NotificationRepository
    ) { }

    async execute(advocateId: string) {
        const totalBookings = await this.bookRepositoty.findByAdvocateId(advocateId)
        const availableSlots = await this.slotRepository.getAvailableSlots(advocateId)
        const reviews = await this.reviewRepository.getReviewsByAdvocateId(new Types.ObjectId(advocateId))
        const totalCases = await this.caseRepository.findAll(advocateId)
        const notification = await this.notificationRepository.findByRecieverId(advocateId)

        const DashboardData = {
            totalBooking: totalBookings,
            availableSlots: availableSlots,
            reviews: reviews,
            cases: totalCases,
            notifications: notification
        }
        return DashboardData
    }
}