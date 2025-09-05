import { SubscriptionProps } from "../../../domain/types/EntityProps";



export interface IGetSubscriptionUsecase {
    execute(advocateId: string): Promise<SubscriptionProps | null>
}