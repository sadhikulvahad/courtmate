import { ReturnDTO } from "../../../application/dto";



export interface IDeleteReviewUsecase {
    execute(reviewId: string): Promise<ReturnDTO>
}