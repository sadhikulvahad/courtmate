import { addHours, isBefore, isValid, startOfDay } from "date-fns";
import { Slot } from "../../../domain/entities/Slot";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { SlotProps } from "../../../domain/types/EntityProps";
import { Types } from "mongoose";

export class AddSlot {
  constructor(private slotRepository: SlotRepository) { }

  async execute(props: SlotProps): Promise<Slot> {
    // Validate input
    if (!props.advocateId || !props.date || !props.time || props.isAvailable === undefined) {
      throw new Error('Required fields are missing');
    }
    if (!isValid(props.date) || !isValid(props.time)) {
      throw new Error('Invalid date or time');
    }
    if (isBefore(props.date, startOfDay(new Date())) || isBefore(props.time, new Date())) {
      throw new Error('Cannot create slot in the past');
    }
    // Convert advocateId to string
    const advocateIdStr = typeof props.advocateId === 'string' ? props.advocateId : props.advocateId.toString();

    // Check for conflicting slots (same advocate, same time)
    const startTime = props.time;
    const endTime = addHours(startTime, 1); // Assume 1-hour slots
    const existingSlots = await this.slotRepository.findByAdvocateId(
      advocateIdStr,
      startTime,
      endTime
    );
    if (existingSlots.length > 0) {
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