import { RecurringRuleProps } from "../../../domain/types/EntityProps";


export interface IGetRecurringRules {
    execute(advocateId: string): Promise<RecurringRuleProps[]>
}