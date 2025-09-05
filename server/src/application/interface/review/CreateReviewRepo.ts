import { ReviewProps } from "../../../domain/types/EntityProps";

export interface ICreateReview {
    execute(reviewData: Omit<ReviewProps, "id" | "createdAt">): Promise<ReviewProps>
}