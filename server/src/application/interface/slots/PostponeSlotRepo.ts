import { Slot } from "../../../domain/entities/Slot";


export interface IPostponeSlot {
    execute(slotId: string, advocateId: string, data: { date: string, time: string, reason: string }): Promise<Slot>
}