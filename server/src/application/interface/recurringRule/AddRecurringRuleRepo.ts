import { RecurringRulePropsDTO } from "../../../application/dto";
import { RecurringRuleProps } from "../../../domain/types/EntityProps";


export interface IAddRecurringRule {
    execute(ruleData: Omit<RecurringRuleProps, '_id'>): Promise<RecurringRulePropsDTO>
}