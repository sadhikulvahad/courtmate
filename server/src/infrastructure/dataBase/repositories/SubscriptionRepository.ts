// infrastructure/database/mongodb/SubscriptionRepositoryImpl.ts

import { SubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";
import { SubscriptionModel } from "../models/Subscription";
import { SubscriptionProps } from "../../../domain/types/EntityProps";

export class SubscriptionRepositoryImpl implements SubscriptionRepository {
  async createSubscription(subscription: SubscriptionProps): Promise<SubscriptionProps> {
    return await SubscriptionModel.create(subscription);
  }

  async getSubscriptionByAdvocateId(advocateId: string): Promise<SubscriptionProps | null> {
    return await SubscriptionModel.findOne({ advocateId }).lean();
  }

  async getAllSubscriptions(): Promise<SubscriptionProps[]> {
    return await SubscriptionModel.find().lean();
  }
}
