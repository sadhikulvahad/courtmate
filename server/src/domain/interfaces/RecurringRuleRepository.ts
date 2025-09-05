import { RecurringRuleProps } from "domain/types/EntityProps";
import { RecurringRule } from "../entities/recurringRule";


export interface IRecurringRuleRepository {
  findByAdvocateId(advocateId: string): Promise<RecurringRuleProps[]>;
  create(rule: RecurringRule): Promise<RecurringRule>;
}