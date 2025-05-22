



import Express, { Request, Response } from "express";
import { UserController } from "../../controllers/user/userController";
import { createAuthMiddleware } from "../../../infrastructure/web/authMiddlware";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { RefreshTokenUseCase } from "../../../application/useCases/auth/refreshTokenUseCase";
import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/userRepository";

const router = Express.Router()

const userController = new UserController()
const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService()
const refreshToken = new RefreshTokenUseCase(tokenService, userRepository)
const auth = createAuthMiddleware(tokenService, refreshToken)

router.put('/toggleUser', auth , (req: Request, res: Response) => {
    userController.toggleUserisBlocked(req, res)}
);

router.put('/resetPassword', auth,  (req: Request, res: Response) => {
    userController.resetPassword(req,res)
})


export default router