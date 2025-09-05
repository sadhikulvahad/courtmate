import { SubscriptionProps } from "../../../domain/types/EntityProps";



export interface IGetAllSubscriptionsUsecase {
    execute(): Promise<SubscriptionProps[]>
}