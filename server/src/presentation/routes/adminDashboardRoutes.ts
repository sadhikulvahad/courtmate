
import express, { Request, Response } from 'express'
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository'
import { JwtTokenService } from '../../infrastructure/services/jwt'
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase'
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware'
import { AdminDashboardController } from '../controllers/adminDashboardController'
import { BookingRepositoryImplements } from '../../infrastructure/dataBase/repositories/BookingRepository'
import { GetAdminDashboard } from '../../application/useCases/admin/GetAdminDashboard'

const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService()
const refreshTokenUsecase = new RefreshTokenUseCase(tokenService, userRepository)
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUsecase)

const router = express.Router()

const bookingRepository = new BookingRepositoryImplements()
const getAdvocateDashboard = new GetAdminDashboard(bookingRepository, userRepository)
const adminDashboardController = new AdminDashboardController(getAdvocateDashboard)


router.get('/:adminId', authMiddleware, (req: Request, res: Response) => {
    adminDashboardController.getAdminDashboardData(req, res)
})


export default router