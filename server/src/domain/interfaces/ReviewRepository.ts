import { Types } from "mongoose";
import { ReviewProps } from "../types/EntityProps";

export interface ReviewRepository {
    create(reviewProps: ReviewProps): Promise<ReviewProps>;
    getReviewsByAdvocateId(advocatId: Types.ObjectId): Promise<ReviewProps[]>
    updateReview(data: { reviewId: string; review?: string; rating?: number }): Promise<ReviewProps | null>;
    deleteReview(reviewId: string): Promise<ReviewProps | null>;
}