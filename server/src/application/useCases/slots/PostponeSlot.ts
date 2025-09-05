
import { Slot } from '../../../domain/entities/Slot';
import { ISlotRepository } from 'domain/interfaces/SlotRepository';
import { Types } from 'mongoose';
import { parse } from 'date-fns';
import { BookingStatus } from '../../../domain/types/EntityProps';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../types';
import { IBookingRepository } from '../../../domain/interfaces/BookingRepository';
import { IPostponeSlot } from '../../../application/interface/slots/PostponeSlotRepo';


@injectable()
export class PostponeSlot implements IPostponeSlot {
    constructor(
        @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository,
        @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository
    ) { }

    async execute(
        slotId: string,
        advocateId: string,
        data: { date: string; time: string; reason?: string }
    ): Promise<Slot> {
        // Validate inputs
        if (!Types.ObjectId.isValid(slotId) || !Types.ObjectId.isValid(advocateId)) {
            throw new Error('Invalid slot ID or advocate ID');
        }

        // Parse new date and time
        const newDate = parse(data.date, 'yyyy-MM-dd', new Date());
        const newTime = parse(`${data.date}T${data.time}`, 'yyyy-MM-dd\'T\'HH:mm', new Date());

        // Fetch the slot
        const slot = await this._slotRepository.findById(slotId);
        if (!slot) {
            throw new Error('Slot not found');
        }

        // Verify ownership
        if (slot.advocateId !== advocateId) {
            throw new Error('Slot does not belong to this advocate');
        }

        // Update the slot
        slot.postpone(newDate, newTime, data.reason);

        // If the slot is booked, update the associated booking
        if (!slot.isAvailable) {
            const booking = await this._bookingRepository.findBySlotId(slotId);
            if (booking) {
                await this._bookingRepository.updateBooking(booking.id, {
                    date: newDate,
                    time: newTime,
                    status: 'postponed',
                    notes: 'Postponed by advocate',
                    postponeReason: data.reason || 'Postponed by advocate',
                });
            }
        }

        // Save the updated slot
        const updatedSlot = await this._slotRepository.update(slotId, {
            date: slot.date,
            time: slot.time,
            status: slot.status as BookingStatus,
            postponeReason: slot.postponeReason,
        });

        return updatedSlot;
    }
}
