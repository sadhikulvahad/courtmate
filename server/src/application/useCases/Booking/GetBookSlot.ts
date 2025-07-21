import { inject, injectable } from "inversify";
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { TYPES } from "../../../types";

@injectable()
export class GetBookSlot {
  constructor(@inject(TYPES.BookingRepository) private bookingRepository: BookingRepository) {}

  async execute(userId: string): Promise<Booking[]> {

    if (!userId) {
      throw new Error('userId is required');
    }
    return await this.bookingRepository.findByUserId(userId);
  }
}
