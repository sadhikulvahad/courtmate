import { inject, injectable } from "inversify";
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { TYPES } from "../../../types";


@injectable()
export class GetCallHistoryUseCase {
  constructor(@inject(TYPES.BookingRepository) private readonly bookingRepo: BookingRepository) { }

  async execute(userId: string, role: string): Promise<Booking[]> {
    if (role === 'user') {
      return await this.bookingRepo.getPastBookingsByUserId(userId);
    }
    return await this.bookingRepo.getPastBookingsByAdvocateId(userId);
  }
}
