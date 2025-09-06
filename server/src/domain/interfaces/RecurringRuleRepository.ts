import { RecurringRuleProps } from "domain/types/EntityProps";
import { RecurringRule } from "../entities/RecurringRule";


export interface IRecurringRuleRepository {
  findByAdvocateId(advocateId: string): Promise<RecurringRuleProps[]>;
  create(rule: RecurringRule): Promise<RecurringRule>;
}