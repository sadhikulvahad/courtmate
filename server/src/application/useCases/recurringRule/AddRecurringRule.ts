
import { eachDayOfInterval, isSameDay, isValid, isBefore, startOfDay, format } from 'date-fns';
import { RecurringRuleRepository } from '../../../domain/interfaces/RecurringRuleRepository';
import { SlotRepository } from '../../../domain/interfaces/SlotRepository';
import { RecurringRule } from '../../../domain/entities/recurringRule';
import { Slot } from '../../../domain/entities/Slot';
import { RecurringRuleProps } from '../../../domain/types/EntityProps';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../types';


@injectable()
export class AddRecurringRule {
  constructor(
    @inject(TYPES.ReccurringRepository) private recurringRuleRepository: RecurringRuleRepository,
    @inject(TYPES.SlotRepository) private slotRepository: SlotRepository,
  ) { }

  async execute(ruleData: Omit<RecurringRuleProps, '_id'>): Promise<any> {
    const rule = new RecurringRule(ruleData);


    const slots: Slot[] = this.generateSlots(rule);
    for (const slot of slots) {
      const existingSlot = await this.slotRepository.findByAdvocateId(slot.advocateId, new Date(slot.date), new Date(slot.time))

      if (existingSlot) {
        continue
      }
      
      await this.slotRepository.create(slot);
    }

    try {

      const savedRule = await this.recurringRuleRepository.create(rule);

      return {
        ...savedRule.toJSON(),
        generatedSlotCount: slots.length,
      };
    } catch (err) {
      console.error('Error in recurringRuleRepository.create:', err);
      throw new Error('Recurring rule creation failed');
    }
  }




  private generateSlots(rule: RecurringRule): Slot[] {
    const startDate = new Date(rule.startDate);
    const endDate = new Date(rule.endDate);
    const today = startOfDay(new Date());

    const days = eachDayOfInterval({
      start: new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate())),
      end: new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()))
    });

    const slots: Slot[] = [];

    for (const day of days) {
      const dayOfWeek = day.getUTCDay();

      const currentDay = new Date(Date.UTC(
        day.getUTCFullYear(),
        day.getUTCMonth(),
        day.getUTCDate()
      ));

      if (
        rule.daysOfWeek.includes(dayOfWeek) &&
        !isBefore(currentDay, today) &&
        !rule.exceptions?.some(ex => isSameDay(ex, currentDay))
      ) {
        const [hours, minutes] = rule.timeSlot.split(':').map(Number);

        const slotDate = new Date(Date.UTC(
          currentDay.getUTCFullYear(),
          currentDay.getUTCMonth(),
          currentDay.getUTCDate(),
          hours,
          minutes
        ));

        const slot = Slot.fromDB({
          advocateId: rule.advocateId,
          date: slotDate,
          time: slotDate,
          isAvailable: true,
          status: 'confirmed'
        });

        slots.push(slot);
      }
    }

    return slots;
  }

}