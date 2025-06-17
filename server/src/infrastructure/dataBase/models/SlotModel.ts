import mongoose, { Schema } from "mongoose";
import { SlotProps } from "../../../domain/types/EntityProps";



const slotSchema = new Schema<SlotProps>(
  {
    advocateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    isAvailable: { type: Boolean, required: true },
    status : {type: String, required : true},
    postponeReason: { type: String },
  },
  { timestamps: true },
);

export const SlotModel = mongoose.model<SlotProps>('Slot', slotSchema);