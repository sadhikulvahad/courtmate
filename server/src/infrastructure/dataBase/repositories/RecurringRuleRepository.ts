import { RecurringRule } from '../../../domain/entities/recurringRule';
import { RecurringRuleRepository } from '../../../domain/interfaces/RecurringRuleRepository';
import { RecurringRuleModel } from '../models/recurringRuleModel';


export class RecurringRuleRepositoryImplement implements RecurringRuleRepository {
  async findByAdvocateId(advocateId: string): Promise<RecurringRule[]> {
    const rules = await RecurringRuleModel.find({ advocateId }).lean().exec();
    return rules.map((rule) => new RecurringRule(rule));
  }

  async create(rule: RecurringRule): Promise<RecurringRule> {
    const createdDoc = await RecurringRuleModel.create(rule.toJSON());
    // createdDoc should include advocateId
    return new RecurringRule(createdDoc.toObject());
  }
}