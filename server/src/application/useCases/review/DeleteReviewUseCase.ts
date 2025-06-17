export class DeleteReviewUseCase {
    constructor(private reviewRepository: any) { }

    async execute(reviewId: string) {
        const existingReview = await this.reviewRepository.deleteReview(reviewId);
        if (!existingReview) {
            throw new Error("Review not found");
        }
    }
}