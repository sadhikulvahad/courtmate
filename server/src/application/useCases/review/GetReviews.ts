import { ReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { Types } from "mongoose";
import { ReviewProps } from "../../../domain/types/EntityProps";

export class GetReviewsUseCase {
    constructor(private reviewRepository: ReviewRepository) {}

    async execute(advocateId: string): Promise<ReviewProps[]> {
        const objectId = new Types.ObjectId(advocateId);
        const reviews = await this.reviewRepository.getReviewsByAdvocateId(objectId);
        return reviews;
    }
}
