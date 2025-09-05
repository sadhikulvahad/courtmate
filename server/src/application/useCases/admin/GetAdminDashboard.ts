
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { AdminDashboardDTO } from "../../../application/dto";
import { IGetAdminDashboardRepo } from "../../../application/interface/admin/GetAdminDashboardRepo";


@injectable()
export class GetAdminDashboard implements IGetAdminDashboardRepo {
    constructor(
        @inject(TYPES.IBookingRepository) private _bookRepositoty: IBookingRepository,
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(): Promise<AdminDashboardDTO> {
        const totalBookings = await this._bookRepositoty.findAll()
        const totalusers = await this._userRepository.findUsers()
        const totalAdvocates = await this._userRepository.findAdvocates()

        const DashboardData  = {
            totalBooking: totalBookings.length,
            totalUser: totalusers.length,
            advocates: totalAdvocates
        }
        return DashboardData
    }
}