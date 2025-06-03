import { Types } from "mongoose";
import { Slot } from "../../../domain/entities/Slot";
import { SlotRepository } from "../../../domain/interfaces/SlotRepository";
import { SlotModel } from "../models/SlotModel";



export class MongooseSlotRepository implements SlotRepository {
  async findByAdvocateId(advocateId: string, startDate: Date, endDate: Date): Promise<Slot[]> {
    const objectId = new Types.ObjectId(advocateId)
    const slots = await SlotModel.find({
      advocateId: objectId,
      date: { $gte: startDate, $lte: endDate },
    }).lean().exec();
    return slots.map((slot) => Slot.fromDB(slot));
  }

  async create(slot: Slot): Promise<Slot> {
    try {
      const newSlot = new SlotModel(slot.toJSON());
      console.log(newSlot)
      const saved = await newSlot.save();
      console.log(saved)
      return Slot.fromDB(saved);
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?._id) {
        throw new Error('Duplicate slot: a slot with this ID already exists');
      }
      throw new Error('Error saving slot: ' + err.message);
    }
  }

  async update(slot: Slot): Promise<Slot> {
    const slotData = slot.toJSON();
    const updatedSlot = await SlotModel.findByIdAndUpdate(
      slotData.id,
      { isAvailable: slotData.isAvailable },
      { new: true }
    ).exec();
    if (!updatedSlot) {
      throw new Error('Slot not found');
    }
    return Slot.fromDB(updatedSlot);
  }
}