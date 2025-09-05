import { addDays, endOfDay, isBefore, isValid, startOfDay } from "date-fns";
import { Booking } from "../../../domain/entities/Booking";
import { IBookingRepository } from "../../../domain/interfaces/BookingRepository";
import { ISlotRepository } from "../../../domain/interfaces/SlotRepository";
import { BookingProps, BookingStatus } from "../../../domain/types/EntityProps";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { Types } from "mongoose";
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { IBookSlot } from "../../../application/interface/booking/BookSlotRepo";


@injectable()
export class BookSlot implements IBookSlot {
  constructor(
    @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.NotificationService) private _notificationService: NotificationService
  ) { }

  async execute(
    advocateId: string,
    slotId: string,
    userId: string,
    usrname: string,
    notes?: string,
    user?: { id: string; name: string },
    caseId?: string
  ): Promise<Booking> {

    const today = startOfDay(new Date());
    const futureDate = endOfDay(addDays(today, 30));
    const slots = await this._slotRepository.findByAdvocateId(advocateId, today, futureDate);
    const slot = slots.find((s) => s?.id.toString() === slotId);
    const advocate = await this._userRepository.findById(advocateId)
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
      roomId: `room-${uuidv4()}`,
      caseId: caseId
    };

    console.log(bookingProps)

    const booking = Booking.fromDB(bookingProps);
    const savedBooking = await this._bookingRepository.create(booking);

    console.log('askhdfaosgfb', savedBooking)

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

    await this._notificationService?.sendNotification({
      recieverId: new Types.ObjectId(advocateId),
      senderId: new Types.ObjectId(userId),
      message: `${usrname} wants to book your slot on ${formattedDateTime}`,
      read: false,
      type: 'Notification',
      createdAt: new Date()
    })

    await this._notificationService?.sendNotification({
      recieverId: new Types.ObjectId(userId),
      senderId: new Types.ObjectId(advocateId),
      message: `You have booked Advocate ${advocate?.name}'s Slot At ${formattedDateTime}`,
      read: false,
      type: 'Notification',
      createdAt: new Date()
    })

    slot.markAsBooked()
    await this._slotRepository.update(slot.id, {
      ...slot.toJSON(),
      status: slot.toJSON().status as BookingStatus,
    });

    return savedBooking;
  }
}