import { inject, injectable } from "inversify";
import { ISubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";
import { TYPES } from "../../../types";
import { IGetSubscriptionUsecase } from "../../../application/interface/subscription/GetSubscriptionUsecase";
import { SubscriptionProps } from "../../../domain/types/EntityProps";


@injectable()
export class GetSubscriptionUseCase implements IGetSubscriptionUsecase {
  constructor(
    @inject(TYPES.ISubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository
  ) { }

  async execute(advocateId: string) :Promise<SubscriptionProps | null> {
    return await this._subscriptionRepository.getSubscriptionByAdvocateId(advocateId);
  }
}
