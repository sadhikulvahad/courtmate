// usecases/recurringRule/GetRecurringRulesByAdvocate.ts
import { RecurringRuleRepository } from "../../../domain/interfaces/RecurringRuleRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { RecurringRuleProps } from "domain/types/EntityProps";


@injectable()
export class GetRecurringRulesByAdvocate {
  constructor(@inject(TYPES.ReccurringRepository) private recurringRuleRepository: RecurringRuleRepository) { }

  async execute(advocateId: string): Promise<RecurringRuleProps[]> {
    if (!advocateId) {
      throw new Error("Advocate ID is required");
    }

    const rules = await this.recurringRuleRepository.findByAdvocateId(advocateId);
    return rules;
  }
}
