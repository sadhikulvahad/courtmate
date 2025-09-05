import { ReturnDTO } from "../../../application/dto";


export interface ICancelBookingRepo {
    execute(bookingId: string): Promise<ReturnDTO>
}