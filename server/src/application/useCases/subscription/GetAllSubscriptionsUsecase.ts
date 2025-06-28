import { SubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";

export class GetAllSubscriptionsUseCase {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async execute() {
    return await this.subscriptionRepository.getAllSubscriptions();
  }
}
