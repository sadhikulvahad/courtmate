import { ReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { Types } from "mongoose";
import { ReviewProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class GetReviewsUseCase {
    constructor(@inject(TYPES.ReviewRepository) private reviewRepository: ReviewRepository) { }

    async execute(advocateId: string): Promise<ReviewProps[]> {
        const objectId = new Types.ObjectId(advocateId);
        const reviews = await this.reviewRepository.getReviewsByAdvocateId(objectId);
        return reviews;
    }
}
