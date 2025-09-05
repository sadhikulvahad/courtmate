import { Booking } from "../../../domain/entities/Booking";


export interface IGetBookSlot {
    execute(userId: string, role : string): Promise<Booking[]>
}