import { ReviewProps } from "../../../domain/types/EntityProps";


export interface IGetReviews {
    execute(advocateId: string) : Promise <ReviewProps[]> 
}