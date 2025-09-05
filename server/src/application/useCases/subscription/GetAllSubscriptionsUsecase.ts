import { inject, injectable } from "inversify";
import { ISubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";
import { TYPES } from "../../../types";
import { IGetAllSubscriptionsUsecase } from "../../../application/interface/subscription/GetAllSubscriptionUsecaseRepo";
import { SubscriptionProps } from "../../../domain/types/EntityProps";


@injectable()
export class GetAllSubscriptionsUseCase implements IGetAllSubscriptionsUsecase {
  constructor(
    @inject(TYPES.ISubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository
  ) { }

  async execute() :Promise<SubscriptionProps[]> {
    return await this._subscriptionRepository.getAllSubscriptions();
  }
}
