
import { SubscriptionProps } from "../types/EntityProps";

export class Subscription {
  private props: SubscriptionProps;

  private constructor(props: SubscriptionProps) {
    this.props = props;
  }

  static create(props: Omit<SubscriptionProps, "createdAt" | "updatedAt">): Subscription {
    if (!props.advocateId || !props.plan || !props.price || !props.nextBillingDate) {
      throw new Error("Missing required subscription fields");
    }

    return new Subscription({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Used to load from DB
  static fromDB(props: SubscriptionProps): Subscription {
    return new Subscription(props);
  }

  get advocateId() {
    return this.props.advocateId;
  }

  get plan() {
    return this.props.plan;
  }

  get price() {
    return this.props.price;
  }

  get billingCycle() {
    return this.props.billingCycle;
  }

  get nextBillingDate() {
    return this.props.nextBillingDate;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  // For serialization (sending to frontend)
  toJSON() {
    return {
      advocateId: this.props.advocateId,
      plan: this.props.plan,
      price: this.props.price,
      billingCycle: this.props.billingCycle,
      nextBillingDate: this.props.nextBillingDate,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
