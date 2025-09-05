import { UpdateReviewDTO } from "../../../application/dto";
import { ReviewProps } from "../../../domain/types/EntityProps";


export interface IUpdateReviewUsecase {
    execute(data: UpdateReviewDTO): Promise<ReviewProps>
}