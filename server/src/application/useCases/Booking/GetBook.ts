import { inject, injectable } from "inversify";
import { Booking } from "../../../domain/entities/Booking";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { Types } from "mongoose";
import { TYPES } from "../../../types";
import { IGetBookingThisHour } from "../../../application/interface/booking/GetBookRepo";


@injectable()
export class GetBookingThisHourUseCase implements IGetBookingThisHour {
  constructor(
    @inject(TYPES.IBookingRepository) private readonly _bookingRepository: IBookingRepository
  ) { }

  async execute(advocateId: string, userId: string): Promise<Booking | null> {
    const now = new Date();

    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0);

    const endOfHour = new Date(now);
    endOfHour.setMinutes(59, 59, 999);

    return await this._bookingRepository.getBook(
      new Types.ObjectId(advocateId),
      new Types.ObjectId(userId),
    );
  }
}
