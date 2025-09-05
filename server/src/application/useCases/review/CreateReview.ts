import { IReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { ReviewProps } from "../../../domain/types/EntityProps";
import { Review } from "../../../domain/entities/Review";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { ICreateReview } from "../../../application/interface/review/CreateReviewRepo";


@injectable()
export class CreateReviewUseCase implements ICreateReview {
    constructor(
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepository
    ) { }

    async execute(reviewData: Omit<ReviewProps, "id" | "createdAt">): Promise<ReviewProps> {
        const review = Review.create({
            ...reviewData,
            createdAt: new Date(), // business logic to enforce timestamp
        });

        const createdReview = await this._reviewRepository.create(review.toJSON());
        return createdReview;
    }
}
