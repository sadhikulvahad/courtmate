import { IReviewRepository } from "../../../domain/interfaces/ReviewRepository";
import { Types } from "mongoose";
import { ReviewProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IGetReviews } from "../../../application/interface/review/GetReviewRepo";


@injectable()
export class GetReviewsUseCase implements IGetReviews {
    constructor(
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepository
    ) { }

    async execute(advocateId: string): Promise<ReviewProps[]> {
        const objectId = new Types.ObjectId(advocateId);
        const reviews = await this._reviewRepository.getReviewsByAdvocateId(objectId);
        return reviews;
    }
}
