import Express, { Request, Response } from "express";
import { AdvocateController } from "../../controllers/admin/advocateController";
import { createAuthMiddleware } from "../../../infrastructure/web/authMiddlware";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { RefreshTokenUseCase } from "../../../application/useCases/auth/refreshTokenUseCase";
import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/userRepository";


const router = Express.Router()
const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService();
const refreshTokenUseCase = new  RefreshTokenUseCase(tokenService,userRepository)

const advocateController = new AdvocateController()
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase)

router.get('/getAdvocates', authMiddleware, (req:Request, res: Response) => {
    advocateController.getAdminAdvocates(req, res)
})

router.put('/statusUpdate',authMiddleware,  (req: Request, res: Response) => {
    advocateController.advocateStatusUpdate(req,res)
})

export default router