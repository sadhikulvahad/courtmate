

import Express, { Request, Response } from "express";
import { advProfileController } from "../../controllers/advocate/advProfileController";
const router = Express.Router()
import { upload } from "../../../infrastructure/web/multer";
import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/userRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { RefreshTokenUseCase } from "../../../application/useCases/auth/refreshTokenUseCase";
import { createAuthMiddleware } from "../../../infrastructure/web/authMiddlware";

const profileController = new advProfileController()
const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService()
const refreshToken = new RefreshTokenUseCase(tokenService, userRepository)
const auth = createAuthMiddleware(tokenService, refreshToken)

router.get('/getUser/:id', auth, (req: Request, res: Response) => {
  profileController.getUser(req, res)
})

router.get('/details', auth, (req: Request, res: Response) => {
  profileController.getAdvocateDetail(req, res)
})

router.put(
  '/updateAdvProfile', auth,
  upload,
  (req: Request, res: Response) => {
    profileController.updateAdvocateProfile(req, res);
  }
);


router.put(
  '/updateAdvocate',
  auth,
  upload,
  (req: Request, res: Response) => {
    profileController.updateAdvocate(req, res);
  }
);


export default router