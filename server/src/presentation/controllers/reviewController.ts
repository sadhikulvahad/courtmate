import { Request, Response } from "express";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { ICreateReview } from "../../application/interface/review/CreateReviewRepo";
import { IGetReviews } from "../../application/interface/review/GetReviewRepo";
import { IUpdateReviewUsecase } from "../../application/interface/review/UpdateReviewUsecaseRepo";
import { IDeleteReviewUsecase } from "../../application/interface/review/DeleteReviewUsecaseRepo";


@injectable()
export class ReviewController {
    constructor(
        @inject(TYPES.ICreateReview) private _createReview: ICreateReview,
        @inject(TYPES.IGetReviews) private _getReview: IGetReviews,
        @inject(TYPES.IUpdateReviewUseCase) private _updateReview: IUpdateReviewUsecase,
        @inject(TYPES.IDeleteReviewUseCase) private _deleteReview: IDeleteReviewUsecase
    ) { }

    // Create Review
    async createReview(req: Request, res: Response) {
        try {
            const { advocateId, userId, review, rating } = req.body;

            if (!advocateId || !userId || !review || !rating) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Missing required fields" });
            }

            const createdReview = await this._createReview.execute({
                advocateId,
                userId,
                review,
                rating,
            });

            res.status(HttpStatus.CREATED).json({ success: true, review: createdReview });
        } catch (error) {
            console.error("Error Creating Review:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    // Get Reviews by Advocate ID
    async getReviewsByAdvocate(req: Request, res: Response) {
        try {
            const { advocateId } = req.query;

            if (!advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Advocate ID is required" });
            }

            const reviews = await this._getReview.execute(advocateId.toString());
            res.status(HttpStatus.OK).json({ success: true, reviews });
        } catch (error) {
            console.error("Error Fetching Reviews:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    async updateReview(req: Request, res: Response) {
        try {
            const { reviewId, review, rating } = req.body;

            if (!reviewId || (!review && !rating)) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Review ID and at least one field (review or rating) are required" });
            }

            const updatedReview = await this._updateReview.execute({
                reviewId,
                review,
                rating,
            });

            res.status(HttpStatus.OK).json({ success: true, review: updatedReview });
        } catch (error) {
            console.error("Error Updating Review:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }

    async deleteReview(req: Request, res: Response) {
        try {
            const { reviewId } = req.query;
            if (!reviewId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: "Review ID is required" });
            }

            await this._deleteReview.execute(reviewId.toString());
            res.status(HttpStatus.OK).json({ success: true, message: "Review deleted successfully" });
        } catch (error) {
            console.error("Error Deleting Review:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: (error as Error).message || "Server error" });
        }
    }
}
