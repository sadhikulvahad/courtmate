import { Types } from "mongoose";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { ReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { NotificationRepository } from "../../../domain/interfaces/NotificationRepository";


export class GetAdvocateDashboard {
    constructor(
        private bookRepositoty : BookingRepository,
        private slotRepository : SlotRepository,
        private reviewREpository : ReviewRepository,
        private caseRepository : CaseRepository,
        private notificationRepository : NotificationRepository
    ){}

    async execute (advocateId: string) {
        const totalBookings = await this.bookRepositoty.findByAdvocateId(advocateId)
        const availableSlots = await this.slotRepository.getAvailableSlots(advocateId)
        const reviews = await this.reviewREpository.getReviewsByAdvocateId(new Types.ObjectId(advocateId))
        const totalCases = await this.caseRepository.findAll(advocateId)
        const notification = await this.notificationRepository.findByRecieverId(advocateId)

        const DashboardData = {
            totalBooking : totalBookings,
            availableSlots : availableSlots,
            reviews : reviews,
            cases : totalCases,
            notifications: notification
        }
        return DashboardData
    }
}