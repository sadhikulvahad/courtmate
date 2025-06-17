import { Request, Response } from "express";
import { CreateReviewUseCase } from "../../application/useCases/review/CreateReview";
import { GetReviewsUseCase } from "../../application/useCases/review/GetReviews";
import { UpdateReviewUseCase } from "../../application/useCases/review/UpdateReviewUseCase";
import { DeleteReviewUseCase } from "../../application/useCases/review/DeleteReviewUseCase";

export class ReviewController {
    constructor(
        private CreateReview: CreateReviewUseCase,
        private GetReview: GetReviewsUseCase,
        private UpdateReview : UpdateReviewUseCase,
        private DeleteReview : DeleteReviewUseCase
    ) { }

    // Create Review
    async createReview(req: Request, res: Response) {
        try {
            const { advocateId, userId, review, rating } = req.body;

            if (!advocateId || !userId || !review || !rating) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const createdReview = await this.CreateReview.execute({
                advocateId,
                userId,
                review,
                rating,
            });

            res.status(201).json({ success: true, review: createdReview });
        } catch (error) {
            console.error("Error Creating Review:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }

    // Get Reviews by Advocate ID
    async getReviewsByAdvocate(req: Request, res: Response) {
        try {
            const { advocateId } = req.query;

            if (!advocateId) {
                return res.status(400).json({ error: "Advocate ID is required" });
            }

            const reviews = await this.GetReview.execute(advocateId.toString());
            res.status(200).json({ success: true, reviews });
        } catch (error) {
            console.error("Error Fetching Reviews:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }

    async updateReview(req: Request, res: Response) {
        try {
            const { reviewId, review, rating } = req.body;
            if (!reviewId || (!review && !rating)) {
                return res.status(400).json({ error: "Review ID and at least one field (review or rating) are required" });
            }

            const updatedReview = await this.UpdateReview.execute({
                reviewId,
                review,
                rating,
            });

            res.status(200).json({ success: true, review: updatedReview });
        } catch (error) {
            console.error("Error Updating Review:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }

    async deleteReview(req: Request, res: Response) {
        try {
            const { reviewId } = req.params;
            if (!reviewId) {
                return res.status(400).json({ error: "Review ID is required" });
            }

            await this.DeleteReview.execute(reviewId);
            res.status(200).json({ success: true, message: "Review deleted successfully" });
        } catch (error) {
            console.error("Error Deleting Review:", error);
            res.status(500).json({ error: (error as Error).message || "Server error" });
        }
    }
}
