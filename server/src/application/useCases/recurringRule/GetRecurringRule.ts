// usecases/recurringRule/GetRecurringRulesByAdvocate.ts
import { RecurringRuleRepository } from "../../../domain/interfaces/RecurringRuleRepository";
import { RecurringRule } from "../../../domain/entities/recurringRule";

export class GetRecurringRulesByAdvocate {
  constructor(private recurringRuleRepository: RecurringRuleRepository) {}

  async execute(advocateId: string): Promise<RecurringRule[]> {
    if (!advocateId) {
      throw new Error("Advocate ID is required");
    }

    const rules = await this.recurringRuleRepository.findByAdvocateId(advocateId);
    return rules;
  }
}
