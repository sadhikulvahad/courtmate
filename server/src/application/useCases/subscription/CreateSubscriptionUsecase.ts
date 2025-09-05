import { ISubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";
import { SubscriptionProps } from "../../../domain/types/EntityProps";
import { Subscription } from "../../../domain/entities/Subscription";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { User } from "../../../domain/entities/User";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { ICreateSubscriptionUsecase } from "../../../application/interface/subscription/CreateSubscriptionUsecaseRepo";


@injectable()
export class CreateSubscriptionUseCase implements ICreateSubscriptionUsecase {
    constructor(
        @inject(TYPES.ISubscriptionRepository) private _subscriptionRepository: ISubscriptionRepository,
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository

    ) { }

    async execute(subscriptionData: Omit<SubscriptionProps, "createdAt" | "updatedAt">): Promise<SubscriptionProps> {
        const subscription = Subscription.create(subscriptionData);

        const created = await this._subscriptionRepository.createSubscription(subscription.toJSON());
        const userData = await this._userRepository.findById(subscriptionData.advocateId.toString());
        if (!userData) throw new Error("Advocate not found");
        const user = new User(userData);
        user.updateSubscriptionStatus(subscriptionData.plan);
        await this._userRepository.update(subscription.advocateId.toString(), user.toJSON());

        return created;
    }
}
