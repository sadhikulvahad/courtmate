import { Slot } from "../../../domain/entities/Slot";


export interface IGetSlots {
    execute(advocateId: string, month: Date): Promise<Slot[]>
}