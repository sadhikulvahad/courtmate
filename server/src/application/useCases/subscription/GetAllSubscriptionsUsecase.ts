import { inject, injectable } from "inversify";
import { SubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";
import { TYPES } from "../../../types";


@injectable()
export class GetAllSubscriptionsUseCase {
  constructor(@inject(TYPES.SubscriptionRepository) private subscriptionRepository: SubscriptionRepository) { }

  async execute() {
    return await this.subscriptionRepository.getAllSubscriptions();
  }
}
