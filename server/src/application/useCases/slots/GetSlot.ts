import { inject, injectable } from "inversify";
import { Slot } from "../../../domain/entities/Slot";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { startOfMonth, endOfMonth } from 'date-fns';
import { TYPES } from "../../../types";


@injectable()
export class GetSlots {
  constructor(@inject(TYPES.SlotRepository) private slotRepository: SlotRepository) { }

  async execute(advocateId: string, month: Date): Promise<Slot[]> {

    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);
    return await this.slotRepository.findByAdvocateId(advocateId, startDate, endDate);
  }
}