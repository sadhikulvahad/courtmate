import { Types } from 'mongoose';
import { RecurringRule } from '../../../domain/entities/RecurringRule';
import { IRecurringRuleRepository } from '../../../domain/interfaces/RecurringRuleRepository';
import { RecurringRuleModel } from '../models/RecurringRuleModel';
import { RecurringRuleProps } from 'domain/types/EntityProps';


export class RecurringRuleRepositoryImplement implements IRecurringRuleRepository {

  async findByAdvocateId(advocateId: string): Promise<RecurringRuleProps[]> {
    const rules = await RecurringRuleModel.find({ advocateId: new Types.ObjectId(advocateId) }).lean().exec();
    return rules as RecurringRuleProps[];
  }

  async create(rule: RecurringRule): Promise<RecurringRule> {
    const createdDoc = await RecurringRuleModel.create(rule.toJSON());
    return new RecurringRule(createdDoc.toObject());
  }
}