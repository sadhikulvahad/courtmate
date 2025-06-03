import mongoose, { Schema } from 'mongoose';
import { RecurringRuleProps } from '../../../domain/types/EntityProps';


const recurringRuleSchema = new Schema<RecurringRuleProps>({
  advocateId: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  daysOfWeek: { type: [Number], required: true },
  timeSlot: { type: String, required: true },
  exceptions: { type: [Date], default: [] },
});

export const RecurringRuleModel = mongoose.model<RecurringRuleProps>('RecurringRule', recurringRuleSchema);