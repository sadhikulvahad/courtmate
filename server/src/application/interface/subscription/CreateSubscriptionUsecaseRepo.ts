import { SubscriptionProps } from "../../../domain/types/EntityProps";



export interface ICreateSubscriptionUsecase {
    execute(subscriptionData: Omit<SubscriptionProps, 'createdAt' | 'updatedAt'>): Promise<SubscriptionProps>
}