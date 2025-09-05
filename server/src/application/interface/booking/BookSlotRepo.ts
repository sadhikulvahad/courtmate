import { Booking } from "../../../domain/entities/Booking"

export interface IBookSlot {
    execute(advocateId: string,
        slotId: string,
        userId: string,
        usrname: string,
        notes?: string,
        user?: {
            id: string,
            name: string
        },
        caseId?: string
    ): Promise<Booking>
}