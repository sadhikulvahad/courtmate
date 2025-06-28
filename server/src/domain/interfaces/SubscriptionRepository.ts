import { SubscriptionProps } from "../types/EntityProps";

export interface SubscriptionRepository {
  createSubscription(subscription: SubscriptionProps): Promise<SubscriptionProps>;
  getSubscriptionByAdvocateId(advocateId: string): Promise<SubscriptionProps | null>;
  getAllSubscriptions(): Promise<SubscriptionProps[]>;
}
