import { inject, injectable } from "inversify";
import { Slot } from "../../../domain/entities/Slot";
import { ISlotRepository } from "../../../domain/interfaces/SlotRepository";
import { startOfMonth, endOfMonth } from 'date-fns';
import { TYPES } from "../../../types";
import { IGetSlots } from "../../../application/interface/slots/GetSlotRepo";


@injectable()
export class GetSlots implements IGetSlots {
  constructor(
    @inject(TYPES.ISlotRepository) private _slotRepository: ISlotRepository
  ) { }

  async execute(advocateId: string, month: Date): Promise<Slot[]> {

    const startDate = startOfMonth(month);
    const endDate = endOfMonth(month);
    return await this._slotRepository.findByAdvocateId(advocateId, startDate, endDate);
  }
}