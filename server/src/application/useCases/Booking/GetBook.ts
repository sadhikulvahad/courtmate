import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { Types } from "mongoose";

export class GetBookingThisHourUseCase {
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(advocateId: string, userId: string): Promise<Booking | null> {
    const now = new Date();

    console.log(advocateId, userId)

    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0);

    const endOfHour = new Date(now);
    endOfHour.setMinutes(59, 59, 999);

    return await this.bookingRepository.getBook(
      new Types.ObjectId(advocateId),
      new Types.ObjectId(userId),
    );
  }
}
