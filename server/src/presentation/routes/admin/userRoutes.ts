

import Express, { Request, Response } from "express";
import { UserController } from "../../controllers/admin/usersController";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { RefreshTokenUseCase } from "../../../application/useCases/auth/refreshTokenUseCase";
import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/userRepository";
import { createAuthMiddleware } from "../../../infrastructure/web/authMiddlware";

const userController = new UserController
const router = Express.Router()
const tokenService = new JwtTokenService()
const userRepository = new UserRepositoryImplement()
const refreshToken = new RefreshTokenUseCase(tokenService, userRepository)
const auth = createAuthMiddleware(tokenService, refreshToken) 

router.get('/getUsers', auth, (req: Request, res:Response) => {
    userController.getAllUsers(req,res)
})

export default router