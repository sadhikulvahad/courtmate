import { inject, injectable } from "inversify";
import { Booking } from "../../../domain/entities/Booking";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { TYPES } from "../../../types";
import { IGetBookSlot } from "../../../application/interface/booking/GetBookSlotRepo";

@injectable()
export class GetBookSlot implements IGetBookSlot {
  constructor(
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository
  ) { }

  async execute(userId: string, role : string): Promise<Booking[]> {

    if (!userId) {
      throw new Error('userId is required');
    }
    return await this._bookingRepository.findByUserId(userId, role);
  }
}
