import { Router, Request, Response } from "express";
import { JwtTokenService } from "../../infrastructure/services/jwt";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/userRepository";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshTokenUseCase";
import { createAuthMiddleware } from "../../infrastructure/web/authMiddlware";
import { ReviewController } from "../controllers/reviewController";
import { CreateReviewUseCase } from "../../application/useCases/review/CreateReview";
import { ReviewRepositoryImplements } from "../../infrastructure/dataBase/repositories/ReviewRepository";
import { GetReviewsUseCase } from "../../application/useCases/review/GetReviews";
import { UpdateReviewUseCase } from "../../application/useCases/review/UpdateReviewUseCase";
import { DeleteReviewUseCase } from "../../application/useCases/review/DeleteReviewUseCase";


const router = Router()

const tokenService = new JwtTokenService()
const userRepository = new UserRepositoryImplement()
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository)
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase)

const reviewRepository = new ReviewRepositoryImplements()
const createReview = new CreateReviewUseCase(reviewRepository)
const getReview = new GetReviewsUseCase(reviewRepository)
const UpdateReview = new UpdateReviewUseCase(reviewRepository)
const deleteReview = new DeleteReviewUseCase(reviewRepository)
const reviewController = new ReviewController(createReview, getReview, UpdateReview, deleteReview)

router.post('/', authMiddleware, (req: Request, res: Response) => {
    reviewController.createReview(req, res)
})

router.get('/', authMiddleware, (req: Request, res: Response) => {
    reviewController.getReviewsByAdvocate(req, res)
})

router.put('/', authMiddleware, (req: Request, res: Response) => {
    reviewController.updateReview(req, res)
})

router.delete('/:reviewId', authMiddleware, (req: Request, res: Response) => {
    reviewController.deleteReview(req, res)
})

export default router