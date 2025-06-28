
import { Types } from "mongoose";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { UserRepository } from "../../../domain/interfaces/userRepository";



export class GetAdminDashboard {
    constructor(
        private bookRepositoty : BookingRepository,
        private userRepository : UserRepository
    ){}

    async execute () {
        const totalBookings = await this.bookRepositoty.findAll()
        const totalusers = await this.userRepository.findUsers()
        const totalAdvocates = await this.userRepository.findAdvocates()

        const DashboardData = {
            totalBooking : totalBookings.length,
            totalUser : totalusers.length,
            advocates : totalAdvocates
        }
        return DashboardData
    }
}