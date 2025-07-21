import { RecurringRuleProps } from "domain/types/EntityProps";
import { RecurringRule } from "../entities/recurringRule";


export interface RecurringRuleRepository {
  findByAdvocateId(advocateId: string): Promise<RecurringRuleProps[]>;
  create(rule: RecurringRule): Promise<RecurringRule>;
}