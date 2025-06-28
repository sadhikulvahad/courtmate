import { SubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";

export class GetSubscriptionUseCase {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async execute(advocateId: string) {
    return await this.subscriptionRepository.getSubscriptionByAdvocateId(advocateId);
  }
}
