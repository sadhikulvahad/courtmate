import { Booking } from "../../../domain/entities/Booking";


export interface IPostpone {
    execute(date: string, time: string, reason: string, bookId: string): Promise<Booking | null>
}