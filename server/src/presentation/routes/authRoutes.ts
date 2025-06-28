import Express, { Request, Response, Router } from "express";
import { AuthController } from "../controllers/authController";
import passport from "passport";
// import { refreshTokenController } from "../controllers/refreshTokenController";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/userRepository";
import { createAuthMiddleware } from "../../infrastructure/web/authMiddlware";
import { JwtTokenService } from "../../infrastructure/services/jwt";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshTokenUseCase";

const userRepository = new UserRepositoryImplement()
const tokenService = new JwtTokenService();
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository);

const router = Router();
const authController = new AuthController()



router.post("/signup", (req: Request, res: Response) => {
    authController.handleSignup(req, res);
});

router.post("/login", async (req: Request, res: Response) => {
    authController.handleLogin(req, res)
});

router.post("/verify-email", async (req: Request, res: Response) => {
    authController.verifyEmailController(req, res)
})

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
})
);

router.get("/google/callback", passport.authenticate("google", { session: false }),
    (req: Request, res: Response) => {
        authController.handleGoogleCallback(req, res);
    }
);

router.post('/forgotPassword-Mail', async (req: Request, res: Response) => {
    authController.handleForgotPasswordMailService(req, res)
})

router.get("/verify-forgotPassword", async (req: Request, res: Response) => {
    authController.verifyForgotPasswordMail(req, res)
})

router.put('/forgot-ResetPassword', async (req: Request, res: Response) => {
    authController.forgotResetPassword(req, res)
})

router.post("/refresh", async (req: Request, res: Response) => {
    authController.refreshToken(req, res);
})

router.post('/logout', async (req:Request, res: Response) => {
    authController.logout(req,res)
})


export const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase);


export default router;
