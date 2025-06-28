import { Types } from "mongoose";
import { Booking } from "../entities/Booking";
import { BookingProps } from "../types/EntityProps";

export interface BookingRepository {
  findByUserId(userId: string): Promise<Booking[]>;
  create(booking: Booking): Promise<Booking>;
  findByRoomId(roomId: string): Promise<Booking | null>;
  findByBookId(bookId: string): Promise<Booking | null>
  updateBooking(bookId: string, update: Partial<BookingProps>): Promise<Booking | null>;
  getBook(advocateId: Types.ObjectId, userId : Types.ObjectId):Promise<Booking | null>
  getPastBookingsByUserId(userId: string): Promise<Booking[]>
  findByAdvocateId(advocateId : string ) : Promise<Booking[]>
  findAll() : Promise<Booking[]>
  getPastBookingsByAdvocateId(advocateId: string): Promise<Booking[]>
}