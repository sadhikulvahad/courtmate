import { ReviewRepository } from "../../../domain/interfaces/ReviewRepository";

export interface UpdateReviewDTO {
    reviewId: string;
    review?: string;
    rating?: number;
}

export class UpdateReviewUseCase {
    constructor(private reviewRepository: ReviewRepository) { }

    async execute(data: UpdateReviewDTO) {
        const { reviewId, review, rating } = data;

        const updatedReview = await this.reviewRepository.updateReview({ reviewId, review, rating });

        if (!updatedReview) {
            throw new Error("Review not found or failed to update");
        }

        return updatedReview;
    }
}