import { addDays, endOfDay, isEqual, startOfDay } from "date-fns";
import { Booking } from "../../../domain/entities/Booking";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { ISlotRepository } from "../../../domain/interfaces/SlotRepository";
import { BookingStatus } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IPostpone } from "../../../application/interface/booking/PostponeRepo";


@injectable()
export class Postpone implements IPostpone {
    constructor(
        @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository
    ) { }

    async execute(date: string, time: string, reason: string, bookId: string): Promise<Booking | null> {

        if (!bookId) {
            throw new Error('bookId is bookId');
        }
        const booking = await this._bookingRepository.findByBookId(bookId)

        if (!booking) {
            throw new Error('No booking with this bookId')
        }
        const today = startOfDay(new Date());
        const futureDate = endOfDay(addDays(today, 30));

        const slots = await this._slotRepository.findByAdvocateId(booking.advocateId.toString(), today, futureDate)

        const existingSlot = slots.find(slot => {
            return isEqual(Number(booking.slotId), Number(slot.id))
        })

        console.log(slots)
        
        const matchedSlot = slots.find(slot => {
            const slotTime = new Date(slot.time)
            return isEqual(slotTime, new Date(time));
        })

        if (!matchedSlot) {
            throw new Error("No slot available on this time")
        }

        if (!matchedSlot.isAvailable) {
            throw new Error('This slot is already booked by someone.')
        }

        await this._bookingRepository.updateBooking(bookId, {
            slotId: matchedSlot.id,
            date: matchedSlot.date,
            time: matchedSlot.time,
            status: "postponed",
            postponeReason: reason,
        });

        const updated = await this._bookingRepository.findByBookId(bookId);

        matchedSlot.markAsBooked()
        await this._slotRepository.update(matchedSlot.id, {
            ...matchedSlot.toJSON(),
            status: matchedSlot.toJSON().status as BookingStatus,
        });

        if (existingSlot) {
            existingSlot.markASAvailable();

            await this._slotRepository.update(existingSlot.id, {
                ...existingSlot.toJSON(),
                status: existingSlot.toJSON().status as BookingStatus,
            });
        }

        return updated
    }
}
