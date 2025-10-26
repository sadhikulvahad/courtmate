import { IMarkVideoCall } from "../../../application/interface/booking/MarkVideoCallRepo";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";



@injectable()
export class MarkVideoCall implements IMarkVideoCall {
    constructor(
        @inject(TYPES.IBookingRepository) private _bookingRepo: IBookingRepository
    ) { }

    async execute(roomId: string): Promise<void> {
        if (!roomId) {
            throw new Error('roomId is missing');
        }

        const booking = await this._bookingRepo.findByRoomId(roomId)

        if (!booking) {
            throw new Error('Invalid room Id')
        }

        await this._bookingRepo.updateBooking(booking.id, { isVideoCall: true })
    }
}