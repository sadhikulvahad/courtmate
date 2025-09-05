import { inject, injectable } from "inversify";
import { Booking } from "../../../domain/entities/Booking";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { TYPES } from "../../../types";
import { IGetCallHistoryUsecase } from "../../../application/interface/booking/GetCallHistoryUsecaseRepo";


@injectable()
export class GetCallHistoryUseCase implements IGetCallHistoryUsecase {
  constructor(
    @inject(TYPES.IBookingRepository) private readonly _bookingRepo: IBookingRepository
  ) { }

  async execute(userId: string, role: string): Promise<Booking[]> {
    if (role === 'user') {
      return await this._bookingRepo.getPastBookingsByUserId(userId);
    }
    return await this._bookingRepo.getPastBookingsByAdvocateId(userId);
  }
}
