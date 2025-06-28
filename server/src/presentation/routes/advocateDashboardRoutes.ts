import express, { Request, Response } from 'express'
import { AdvocateDashboardController } from '../controllers/advocateDashboardController'
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository'
import { JwtTokenService } from '../../infrastructure/services/jwt'
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase'
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware'
import { GetAdvocateDashboard } from '../../application/useCases/advocate/GetAdvocateDashboard'
import { BookingRepositoryImplements } from '../../infrastructure/dataBase/repositories/BookingRepository'
import { MongooseSlotRepository } from '../../infrastructure/dataBase/repositories/SlotRepository'
import { ReviewRepositoryImplements } from '../../infrastructure/dataBase/repositories/ReviewRepository'
import { CaseRepositoryImplements } from '../../infrastructure/dataBase/repositories/CaseRepository'
import { NotificationRepositoryImplements } from '../../infrastructure/dataBase/repositories/NotificationRepository'


const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService()
const refreshTokenUsecase = new RefreshTokenUseCase(tokenService, userRepository)
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUsecase)

const bookRepository = new BookingRepositoryImplements()
const slotRepository = new MongooseSlotRepository()
const reviewRepository = new ReviewRepositoryImplements()
const caseRepository = new CaseRepositoryImplements()
const notificationRepository = new NotificationRepositoryImplements()
const advocateDashboard = new GetAdvocateDashboard(
    bookRepository,
    slotRepository,
    reviewRepository,
    caseRepository,
    notificationRepository)
const advocateDashboardController = new AdvocateDashboardController(advocateDashboard)

const router = express.Router()


router.get('/:advocateId',authMiddleware, (req: Request, res: Response) => {
    advocateDashboardController.getAdvocateDashboardData(req, res)
})

export default router