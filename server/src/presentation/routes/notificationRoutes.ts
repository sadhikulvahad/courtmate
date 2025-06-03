

import Express, {Request, Response} from 'express'
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository'
import { NotificaitonController } from '../controllers/admin/notificationController'
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware'
import { JwtTokenService } from '../../infrastructure/services/jwt'
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase'

const router = Express.Router()
const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService()
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository)


const notificationController = new NotificaitonController()
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase)

router.get('/:id',authMiddleware, (req:Request, res: Response) => {
    notificationController.getAdminNotifications(req,res)
})

router.put('/markAsRead', authMiddleware, (req: Request, res: Response) => {
    notificationController.markAsRead(req, res)
})

router.put('/markAllAsRead', authMiddleware, (req: Request, res: Response) => {
    notificationController.markAllAsRead(req, res)
})

export default router