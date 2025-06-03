import { Slot } from "../entities/Slot";

export interface SlotRepository {
  findByAdvocateId(advocateId: string, startDate: Date, endDate: Date): Promise<Slot[]>;
  create(slot: Slot): Promise<Slot>;
  update(slot: Slot): Promise<Slot>;
}