

import express, {Request, Response} from 'express'
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository'
import { JwtTokenService } from '../../infrastructure/services/jwt'
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase'
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware'
import { SubscriptionController } from '../controllers/subscriptioncontroller'

const router = express.Router()

const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService()
const refreshTokenUsecase = new RefreshTokenUseCase(tokenService, userRepository)
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUsecase)

const subscriptionController = new SubscriptionController()

router.post('/', authMiddleware, (req:Request, res: Response) => {
    subscriptionController.createSubscription(req,res)
})

router.get('/getAll', authMiddleware, (req: Request, res: Response) => {
    subscriptionController.getAllSubscriptions(req,res)
})

router.get('/:advocateId', authMiddleware, (req: Request, res: Response) => {
    subscriptionController.getSubscription(req, res)
})

export default router