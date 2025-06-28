import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";

export class GetCallHistoryUseCase {
  constructor(private readonly bookingRepo: BookingRepository) { }

  async execute(userId: string, role: string): Promise<Booking[]> {
    if (role === 'user') {
      return await this.bookingRepo.getPastBookingsByUserId(userId);
    }
    return await this.bookingRepo.getPastBookingsByAdvocateId(userId);
  }
}
