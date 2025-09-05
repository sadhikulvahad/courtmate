import { Booking } from "../../../domain/entities/Booking";


export interface IGetCallHistoryUsecase {
    execute(userId: string, role: string): Promise<Booking[]>
}