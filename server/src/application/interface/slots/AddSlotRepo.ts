import { Slot } from "../../../domain/entities/Slot";
import { SlotProps } from "../../../domain/types/EntityProps";


export interface IAddSlot {
    execute(props: SlotProps): Promise<Slot>
}