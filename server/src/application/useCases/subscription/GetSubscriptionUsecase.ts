import { inject, injectable } from "inversify";
import { SubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";
import { TYPES } from "../../../types";


@injectable()
export class GetSubscriptionUseCase {
  constructor(@inject(TYPES.SubscriptionRepository) private subscriptionRepository: SubscriptionRepository) { }

  async execute(advocateId: string) {
    return await this.subscriptionRepository.getSubscriptionByAdvocateId(advocateId);
  }
}
