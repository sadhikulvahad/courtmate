import { Booking } from "../../../domain/entities/Booking";


export interface IGetBookingThisHour {
    execute(advocateId: string, userId: string): Promise<Booking | null>
}