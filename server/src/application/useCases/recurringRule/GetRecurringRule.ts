// usecases/recurringRule/GetRecurringRulesByAdvocate.ts
import { IRecurringRuleRepository } from "../../../domain/interfaces/RecurringRuleRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { RecurringRuleProps } from "../../../domain/types/EntityProps";
import { IGetRecurringRules } from "../../../application/interface/recurringRule/GetRecurringRuleRepo";


@injectable()
export class GetRecurringRulesByAdvocate implements IGetRecurringRules {
  constructor(
    @inject(TYPES.IReccurringRepository) private _recurringRuleRepository: IRecurringRuleRepository
  ) { }

  async execute(advocateId: string): Promise<RecurringRuleProps[]> {
    if (!advocateId) {
      throw new Error("Advocate ID is required");
    }

    const rules = await this._recurringRuleRepository.findByAdvocateId(advocateId);
    return rules;
  }
}
