import { Slot } from "../entities/Slot";
import { SlotProps } from "../types/EntityProps";

export interface SlotRepository {
  findByAdvocateId(advocateId: string, startDate: Date, endDate: Date): Promise<Slot[]>;
  create(slot: Slot): Promise<Slot>;
  update(id: string, updates: Partial<SlotProps>): Promise<Slot>;

}