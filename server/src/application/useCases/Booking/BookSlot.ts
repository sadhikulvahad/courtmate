import { addDays, endOfDay, isBefore, isValid, startOfDay } from "date-fns";
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { BookingProps } from "../../../domain/types/EntityProps";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { Types } from "mongoose";
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export class BookSlot {
  constructor(
    private bookingRepository: BookingRepository,
    private slotRepository: SlotRepository
  ) { }

  async execute(
    advocateId: string,
    slotId: string,
    userId: string,
    notes?: string,
    user?: {
      id: string,
      name: string
    },
    notificationService?: NotificationService
  ): Promise<Booking> {

    const today = startOfDay(new Date());
    const futureDate = endOfDay(addDays(today, 30));
    const slots = await this.slotRepository.findByAdvocateId(advocateId, today, futureDate);
    const slot = slots.find((s) => s?.id.toString() === slotId);

    if (!slot) {
      throw new Error('Slot not found');
    }
    if (!slot.isAvailable) {
      throw new Error('Slot is not available');
    }
    if (!isValid(slot.date) || !isValid(slot.time)) {
      throw new Error('Invalid slot date or time');
    }
    if (isBefore(slot.date, today) || isBefore(slot.time, new Date())) {
      throw new Error('Slot date or time is in the past');
    }

    // Create booking
    const bookingProps: BookingProps = {
      advocateId,
      userId,
      slotId,
      date: slot.date,
      time: slot.time,
      status: 'confirmed',
      notes,
      roomId : `room-${uuidv4()}`
    };
    const booking = Booking.fromDB(bookingProps);
    const savedBooking = await this.bookingRepository.create(booking);

    const date = new Date(slot.date);
    const time = new Date(slot.time);

    const combinedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    const formattedDateTime = format(combinedDateTime, 'yyyy-MM-dd hh:mm a');

    await notificationService?.sendNotification({
      recieverId: new Types.ObjectId(advocateId),
      senderId: new Types.ObjectId(userId),
      message: `${user?.name} wants to book your slot on ${formattedDateTime}`,
      read: false,
      type: 'Notification',
      createdAt: new Date()
    })

    slot.markAsBooked()
    await this.slotRepository.update(slot)

    return savedBooking;
  }
}