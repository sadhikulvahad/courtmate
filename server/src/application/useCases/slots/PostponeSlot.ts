
import { Slot } from '../../../domain/entities/Slot';
import { MongooseSlotRepository } from '../../../infrastructure/dataBase/repositories/SlotRepository';
import { Types } from 'mongoose';
import { parse } from 'date-fns';
import { BookingStatus } from '../../../domain/types/EntityProps';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../types';
import { BookingRepository } from '../../../domain/interfaces/BookingRepository';


@injectable()
export class PostponeSlot {
    constructor(
        @inject(TYPES.SlotRepository) private slotRepository: MongooseSlotRepository,
        @inject(TYPES.BookingRepository) private bookingRepository: BookingRepository
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
        const slot = await this.slotRepository.findById(slotId);
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
            const booking = await this.bookingRepository.findBySlotId(slotId);
            if (booking) {
                await this.bookingRepository.updateBooking(booking.id, {
                    date: newDate,
                    time: newTime,
                    status: 'postponed',
                    notes: 'Postponed by advocate',
                    postponeReason: data.reason || 'Postponed by advocate',
                });
            }
        }

        // Save the updated slot
        const updatedSlot = await this.slotRepository.update(slotId, {
            date: slot.date,
            time: slot.time,
            status: slot.status as BookingStatus,
            postponeReason: slot.postponeReason,
        });

        return updatedSlot;
    }
}
