import { ReviewRepository } from "domain/interfaces/ReviewRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";

@injectable()
export class DeleteReviewUseCase {
    constructor(@inject(TYPES.ReviewRepository) private reviewRepository: ReviewRepository) { }

    async execute(reviewId: string) {
        const existingReview = await this.reviewRepository.deleteReview(reviewId);
        if (!existingReview) {
            throw new Error("Review not found");
        }
    }
}