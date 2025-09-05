import { inject, injectable } from "inversify";
import { IReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { TYPES } from "../../../types";
import { IUpdateReviewUsecase } from "../../../application/interface/review/UpdateReviewUsecaseRepo";
import { ReviewProps } from "../../../domain/types/EntityProps";
import { UpdateReviewDTO } from "../../../application/dto";

@injectable()
export class UpdateReviewUseCase implements IUpdateReviewUsecase {
    constructor(
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepository
    ) { }

    async execute(data: UpdateReviewDTO) : Promise <ReviewProps> {
        const { reviewId, review, rating } = data;

        const updatedReview = await this._reviewRepository.updateReview({ reviewId, review, rating });

        if (!updatedReview) {
            throw new Error("Review not found or failed to update");
        }

        return updatedReview;
    }
}