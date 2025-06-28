
import express, { Request, Response } from "express";
import { createAuthMiddleware } from "../../infrastructure/web/authMiddlware";
import { JwtTokenService } from "../../infrastructure/services/jwt";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshTokenUseCase";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/userRepository";
import { CaseController } from "../controllers/caseController";
import { CaseRepositoryImplements } from "../../infrastructure/dataBase/repositories/CaseRepository";

const router = express.Router()

const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService()
const refreshTokenUsecase = new RefreshTokenUseCase(tokenService, userRepository)
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUsecase)


const caseRepository = new CaseRepositoryImplements()
const caseController = new CaseController(caseRepository)

router.post('/', authMiddleware, (req: Request, res: Response) => {
    caseController.createCase(req, res)
})

router.get('/:userId', authMiddleware, (req: Request, res: Response) => {
    caseController.getAllCase(req, res)
})

router.put('/:caseId', authMiddleware, (req: Request, res: Response) => {
    caseController.UpdateCase(req, res)
})

router.delete('/:caseId', authMiddleware, (req: Request, res: Response) => {
    caseController.Deletecase(req, res)
})

router.put('/updateHearing/:caseId', authMiddleware, (req: Request, res: Response) => {
    caseController.updateHearingDate(req, res)
})


export default router