import { SubscriptionRepository } from "../../../domain/interfaces/SubscriptionRepository";
import { SubscriptionProps } from "../../../domain/types/EntityProps";
import { Subscription } from "../../../domain/entities/Subscription";
import { UserRepository } from "../../../domain/interfaces/userRepository";
import { User } from "../../../domain/entities/User";

export class CreateSubscriptionUseCase {
    constructor(
        private subscriptionRepository: SubscriptionRepository,
        private userRepository: UserRepository

    ) { }

    async execute(subscriptionData: Omit<SubscriptionProps, "createdAt" | "updatedAt">): Promise<SubscriptionProps> {
        const subscription = Subscription.create(subscriptionData);

        const created = await this.subscriptionRepository.createSubscription(subscription.toJSON());
        const userData = await this.userRepository.findById(subscriptionData.advocateId.toString());
        if (!userData) throw new Error("Advocate not found");
        const user = new User(userData);
        user.updateSubscriptionStatus(subscriptionData.plan);
        await this.userRepository.update(subscription.advocateId.toString(), user.toJSON());

        return created;
    }
}
