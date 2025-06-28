import { addHours, isBefore, isEqual, isValid, startOfDay } from "date-fns";
import { Slot } from "../../../domain/entities/Slot";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { SlotProps } from "../../../domain/types/EntityProps";
import { Types } from "mongoose";

export class AddSlot {
  constructor(private slotRepository: SlotRepository) { }

  async execute(props: SlotProps): Promise<Slot> {
    if (!props.advocateId || !props.date || !props.time || props.isAvailable === undefined) {
      throw new Error('Required fields are missing');
    }
    if (!isValid(props.date) || !isValid(props.time)) {
      throw new Error('Invalid date or time');
    }
    if (isBefore(props.date, startOfDay(new Date())) || isBefore(props.time, new Date())) {
      throw new Error('Cannot create slot in the past');
    }
    const advocateIdStr = typeof props.advocateId === 'string' ? props.advocateId : props.advocateId.toString();

    const startTime = props.time;
    const endTime = addHours(startTime, 1);
    const existingSlots = await this.slotRepository.getAvailableSlots(
      advocateIdStr,
    );

    const existingSlot = existingSlots.filter(
      (slot) => isEqual(slot.time, startTime)
    );

    if (existingSlot.length > 0) {
      throw new Error('A slot already exists at this time');
    }

    // Create slot without manual _id
    const slot = Slot.fromDB({
      ...props,
      advocateId: new Types.ObjectId(advocateIdStr), // Ensure correct type
    });

    return await this.slotRepository.create(slot);
  }
}