import { Types } from "mongoose";
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { BookingProps } from "../../../domain/types/EntityProps";
import { BookingModel } from "../models/BookingModel";


export class BookingRepositoryImplements implements BookingRepository {
  async findByUserId(userId: string): Promise<Booking[]> {
    const bookings = await BookingModel.find({ userId })
      .populate("advocateId", "name email phone")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return bookings.map((booking) => Booking.fromDB(booking));
  }

  async create(booking: Booking): Promise<Booking> {
    const bookingProps = booking.toJSON();
    const newBooking = new BookingModel(bookingProps);
    const savedBooking = await newBooking.save();
    const populatedBooking = await BookingModel.findById(savedBooking._id)
      .populate("advocateId", "name email phone")
      .lean()
      .exec();

    if (!populatedBooking) {
      throw new Error("Failed to fetch the saved booking");
    }
    return Booking.fromDB(populatedBooking);
  }

  async findByRoomId(roomId: string): Promise<Booking | null> {
    console.log(roomId)
    const booking = await BookingModel.findOne({ roomId: roomId })
      .lean()
      .exec();

    console.log(booking); // for debugging

    if (!booking) {
      return null;
    }

    return Booking.fromDB(booking);
  }

  async findByBookId(bookId: string): Promise<Booking | null> {
    const booking = await BookingModel.findOne({ _id: bookId })
    if (!booking) {
      return null
    }
    return Booking.fromDB(booking.toObject())
  }

  async updateBooking(bookId: string, update: Partial<BookingProps>): Promise<Booking | null> {
    const updated = await BookingModel.findOneAndUpdate(
      { _id: bookId },
      { ...update, updatedAt: new Date() },
      { new: true } // return updated document
    ).lean();

    if (!updated) return null;
    return Booking.fromDB(updated);
  }

  async getAllBookings(): Promise<Booking[] | null> {
    const bookings = await BookingModel.find().lean();
    if (!bookings || bookings.length === 0) return null;

    return bookings.map(booking => Booking.fromDB(booking));
  }

  async getBook(advocateId: Types.ObjectId, userId: Types.ObjectId): Promise<Booking | null> {
    const now = new Date();

    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0);

    const endOfHour = new Date(now);
    endOfHour.setMinutes(59, 59, 999);

    const booking = await BookingModel.findOne({
      advocateId,
      userId,
      time: {
        $gte: startOfHour,
        $lte: endOfHour,
      },
    }).lean()
    return booking ? Booking.fromDB(booking) : null;
  }


  async findBySlotId(id: string): Promise<Booking | null> {
    const booking = await BookingModel.findOne({ slotId: id }).lean()
    if (!booking) return null;

    return Booking.fromDB(booking);
  }

}