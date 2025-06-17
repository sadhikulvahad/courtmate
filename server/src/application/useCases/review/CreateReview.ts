import { ReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { ReviewProps } from "../../../domain/types/EntityProps";
import { Review } from "../../../domain/entities/Review";

export class CreateReviewUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(reviewData: Omit<ReviewProps, "id" | "createdAt">): Promise<ReviewProps> {
        const review = Review.create({
            ...reviewData,
            createdAt: new Date(), // business logic to enforce timestamp
        });

        const createdReview = await this.reviewRepository.create(review.toJSON());
        return createdReview;
    }
}
