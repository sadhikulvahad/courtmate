import { SubscriptionProps } from "../types/EntityProps";

export interface ISubscriptionRepository {
  createSubscription(subscription: SubscriptionProps): Promise<SubscriptionProps>;
  getSubscriptionByAdvocateId(advocateId: string): Promise<SubscriptionProps | null>;
  getAllSubscriptions(): Promise<SubscriptionProps[]>;
}
