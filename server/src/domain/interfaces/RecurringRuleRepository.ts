import { RecurringRule } from "../entities/recurringRule";


export interface RecurringRuleRepository {
  findByAdvocateId(advocateId: string): Promise<RecurringRule[]>;
  create(rule: RecurringRule): Promise<RecurringRule>;
}