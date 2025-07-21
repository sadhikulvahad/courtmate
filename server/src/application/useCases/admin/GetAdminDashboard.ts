
import { Types } from "mongoose";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class GetAdminDashboard {
    constructor(
        @inject(TYPES.BookingRepository) private bookRepositoty: BookingRepository,
        @inject(TYPES.UserRepository) private userRepository: UserRepository
    ) { }

    async execute() {
        const totalBookings = await this.bookRepositoty.findAll()
        const totalusers = await this.userRepository.findUsers()
        const totalAdvocates = await this.userRepository.findAdvocates()

        const DashboardData = {
            totalBooking: totalBookings.length,
            totalUser: totalusers.length,
            advocates: totalAdvocates
        }
        return DashboardData
    }
}