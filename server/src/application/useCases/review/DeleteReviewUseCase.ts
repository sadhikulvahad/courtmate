import { IReviewRepository } from "domain/interfaces/ReviewRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IDeleteReviewUsecase } from "../../../application/interface/review/DeleteReviewUsecaseRepo";
import { ReturnDTO } from "../../../application/dto";

@injectable()
export class DeleteReviewUseCase implements IDeleteReviewUsecase {
    constructor(
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepository
    ) { }

    async execute(reviewId: string) : Promise<ReturnDTO> {
        const existingReview = await this._reviewRepository.deleteReview(reviewId);
        if (!existingReview) {
            throw new Error("Review not found");
        }
        return {
            success : true,
            message : 'Review Deleted Successfully'
        }
    }
}