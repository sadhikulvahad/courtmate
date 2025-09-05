import { Types } from "mongoose";
import { ReviewModel } from "../models/ReviewModel";
import { IReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { ReviewProps } from "../../../domain/types/EntityProps";
import { Review } from "../../../domain/entities/Review";

export class ReviewRepositoryImplements implements IReviewRepository {
    async create(reviewProps: ReviewProps): Promise<ReviewProps> {
        try {
            const review = await ReviewModel.create({
                advocateId: new Types.ObjectId(reviewProps.advocateId),
                userId: new Types.ObjectId(reviewProps.userId),
                review: reviewProps.review,
                rating: reviewProps.rating,
            });

            return Review.fromDB({
                _id: review._id,
                advocateId: review.advocateId,
                userId: review.userId,
                review: review.review,
                rating: review.rating,
                createdAt: review.createdAt,
            }).toJSON();
        } catch (error) {
            throw new Error(`Failed to create review: ${(error as Error).message}`);
        }
    }

    async getReviewsByAdvocateId(advocateId: Types.ObjectId): Promise<ReviewProps[]> {
        try {
            const reviews = await ReviewModel.find({
                advocateId,
                $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
            })
                .sort({ createdAt: -1 })
                .populate('userId', 'name email')
                .lean()
                .exec();

            return reviews.map((review: ReviewProps) =>
                Review.fromDB({
                    _id: review._id,
                    advocateId: review.advocateId,
                    userId: review.userId,
                    review: review.review,
                    rating: review.rating,
                    createdAt: review.createdAt,
                }).toJSON()
            );
        } catch (error) {
            throw new Error(`Failed to get reviews: ${(error as Error).message}`);
        }
    }

    async updateReview(data: { reviewId: string; review?: string; rating?: number }): Promise<ReviewProps | null> {
        try {
            const updated = await ReviewModel.findOneAndUpdate(
                { _id: data.reviewId },
                {
                    ...(data.review !== undefined && { review: data.review }),
                    ...(data.rating !== undefined && { rating: data.rating }),
                    updatedAt: new Date(),
                },
                { new: true }
            )
                .populate('userId', 'name email')
                .lean();

            if (!updated) return null;

            return Review.fromDB(updated).toJSON();
        } catch (error) {
            throw new Error(`Failed to update review: ${(error as Error).message}`);
        }
    }

    async deleteReview(reviewId: string): Promise<ReviewProps | null> {
    try {
        const deleted = await ReviewModel.findOneAndUpdate(
            { _id: reviewId },
            { isDeleted: true, updatedAt: new Date() },
            { new: true }
        )
            .populate('userId', 'name email')
            .lean();

        if (!deleted) return null;

        return Review.fromDB(deleted).toJSON();
    } catch (error) {
        throw new Error(`Failed to delete review: ${(error as Error).message}`);
    }
}
}
