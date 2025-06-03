import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";


export class GetBookSlot {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(userId: string): Promise<Booking[]> {

    if (!userId) {
      throw new Error('userId is required');
    }
    return await this.bookingRepository.findByUserId(userId);
  }
}
