import { addDays, endOfDay, isEqual, startOfDay } from "date-fns";
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { BookingStatus } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class Postpone {
    constructor(
        @inject(TYPES.BookingRepository) private bookingRepository: BookingRepository,
        @inject(TYPES.SlotRepository) private slotRepository: SlotRepository
    ) { }

    async execute(date: string, time: string, reason: string, bookId: string): Promise<Booking | null> {

        if (!bookId) {
            throw new Error('bookId is bookId');
        }
        const booking = await this.bookingRepository.findByBookId(bookId)

        if (!booking) {
            throw new Error('No booking with this bookId')
        }
        const today = startOfDay(new Date());
        const futureDate = endOfDay(addDays(today, 30));

        const slots = await this.slotRepository.findByAdvocateId(booking.advocateId.toString(), today, futureDate)
        const selectedDateTime = new Date(`${date}T${time}`);

        const existingSlot = slots.find(slot => {
            return isEqual(booking.slotId, slot.id)
        })

        const matchedSlot = slots.find(slot => {
            const slotTime = new Date(slot.time);
            return isEqual(slotTime, selectedDateTime);
        })

        if (!matchedSlot) {
            throw new Error("No slot available on this time")
        }

        if (!matchedSlot.isAvailable) {
            throw new Error('This slot is already booked by someone.')
        }

        await this.bookingRepository.updateBooking(bookId, {
            slotId: matchedSlot.id,
            date: matchedSlot.date,
            time: matchedSlot.time,
            status: "postponed",
            postponeReason: reason,
        });

        const updated = await this.bookingRepository.findByBookId(bookId);

        matchedSlot.markAsBooked()
        await this.slotRepository.update(matchedSlot.id, {
            ...matchedSlot.toJSON(),
            status: matchedSlot.toJSON().status as BookingStatus,
        });

        if (existingSlot) {
            existingSlot.markASAvailable();

            await this.slotRepository.update(existingSlot.id, {
                ...existingSlot.toJSON(),
                status: existingSlot.toJSON().status as BookingStatus,
            });
        }

        return updated
    }
}
