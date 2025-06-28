import { Request, Response } from "express";
import { SignupUser } from "../../application/useCases/auth/signupUser";
import { verifyEmail } from "../../application/useCases/auth/verifyEmail";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/userRepository";
import { NodemailerEmailService } from "../../infrastructure/services/sendMail";
import { HashPassword } from "../../infrastructure/services/passwordHash";
import { createEmailConfig } from "../../infrastructure/config/emailConfig";
import { LoginUser } from "../../application/useCases/auth/loginUser";
import { GoogleAuth } from "../../application/useCases/auth/googleAuth";
import { User } from "../../domain/entities/User";
import passport from "passport";
import { forgotPasswordSendMail } from "../../application/useCases/auth/forgotPasswordSendMail";
import { VerifyForgotPasswordMail } from "../../application/useCases/auth/verifyForgotPasswordMail";
import { ResetForgotPassword } from "../../application/useCases/auth/resetForgotPassword";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshTokenUseCase";
import { JwtTokenService } from "../../infrastructure/services/jwt";


export class AuthController {
    private readonly signupUser: SignupUser
    private readonly loginUser: LoginUser
    private readonly emailService: NodemailerEmailService
    private readonly verifyEmail: verifyEmail
    private readonly googleAuth: GoogleAuth
    private readonly forgotPasswordSendMail: forgotPasswordSendMail
    private readonly VerifyForgotPasswordMail: VerifyForgotPasswordMail
    private readonly ResetForgotPassword: ResetForgotPassword
    private readonly refreshTokenUseCase: RefreshTokenUseCase
    private readonly jwtService: JwtTokenService

    constructor() {
        const userRepository = new UserRepositoryImplement()
        const hashPassword = new HashPassword()
        const config = createEmailConfig()
        const tokenService = new JwtTokenService()
        this.jwtService = new JwtTokenService()
        this.googleAuth = new GoogleAuth(userRepository)
        this.refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository)
        this.loginUser = new LoginUser(userRepository, hashPassword, this.jwtService)
        this.emailService = new NodemailerEmailService(config)
        this.signupUser = new SignupUser(userRepository, hashPassword, this.emailService, this.jwtService)
        this.verifyEmail = new verifyEmail(userRepository, this.jwtService)
        this.forgotPasswordSendMail = new forgotPasswordSendMail(userRepository, this.emailService, this.jwtService)
        this.VerifyForgotPasswordMail = new VerifyForgotPasswordMail(userRepository, this.jwtService)
        this.ResetForgotPassword = new ResetForgotPassword(userRepository, hashPassword)
    }

    async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token required" });
        }

        const result = await this.refreshTokenUseCase.execute(refreshToken);
        if (!result.success) {
            return res.status(401).json({
                success: false,
                error: "Token revoked",
                code: "TOKEN_INVALID"
            });
        }

        // 1) reset the refresh cookie
        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // 2) expose the new access token in a header
        res.header("x-access-token", result.accessToken);

        // 3) return JSON body as before
        return res.json({ accessToken: result.accessToken });
    }


    // authController.ts
    async handleGoogleAuth(req: Request, res: Response) {
        const role = req.query.role || 'user';
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            state: JSON.stringify({ role }),
            session: false
        })(req, res);
    }

    async handleGoogleCallback(req: Request, res: Response) {
        try {
            const user = req?.user as unknown as User;
            const token = await this.jwtService.generateToken(user.id, user.role, user.name);
            res.cookie('refreshToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            }).header("x-access-token", token).status(200).json({
                message: "Logged successfully",
                token: token,
                user: user
            });

            res.redirect(`${process.env.REDIRECT_URL}/signup?token=${token}&email=${user.email}`);
        } catch (error) {
            console.error("Error from handleCallbackController", error)
            res.redirect(`${process.env.REDIRECT_URL}/signup?error=AuthenticationFailed`);
        }
    }

    async handleSignup(req: Request, res: Response) {
        try {
            const { name, email, phone, password, role } = req.body

            if (!name || !email || !phone || !password || !role) {
                return res.status(400).json({ success: false, error: "All fields are required" });
            }

            if (!["user", "advocate"].includes(role)) {
                return res.status(400).json({ success: false, error: "Invalid role" });
            }

            const result = await this.signupUser.execute({
                name,
                email,
                phone,
                password,
                role
            })

            if (!result.success) {
                const statusCode = result.error === 'PENDING_ACTIVATION' ? 202 : 400;
                return res.status(statusCode).json({ success: false, error: result.error });
            }
            const verificationToken = this.jwtService.generateEmailVerificationToken(email)
            await this.emailService.sendVerificationEmail(email, verificationToken)
            return res.status(201).json({ success: true, message: "Verification Email send" })

        } catch (error) {
            console.error('Error form signup controller', error)
            res.status(500).json({ success: false, error: "Server Error" })
        }
    }

    async verifyEmailController(req: Request, res: Response) {
        try {
            const { token } = req.query
            if (!token || typeof token != 'string') {
                return res.status(401).json({ error: "Invalid token, please check your eamil" })
            }

            const result = await this.verifyEmail.execute(token)
            if (!result.success) {
                return res.status(400).json({ error: "Invalid Email" })
            } else {
                return res.status(201).json({ message: "Eamil verified successfully" })
            }
        } catch (error) {
            console.error("Error from verify email controller", error)
            res.status(500).json({ error: "Server error" })
        }
    }

    async handleLogin(req: Request, res: Response) {
        try {

            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({ error: "All fields are required" })
            }

            const result = await this.loginUser.execute(email, password)

            if ("error" in result) {
                return res.status(401).json({ error: result.error })
            }

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            }).header("x-access-token", result.token).status(200).json({
                message: "Logged successfully",
                token: result.token,
                user: result.user
            });
        } catch (error) {
            console.error("Error from login controller", error)
            res.status(500).json({ error: "Server Error" })
        }
    }

    async handleForgotPasswordMailService(req: Request, res: Response) {
        try {
            const { email } = req.body
            if (!email) {
                return res.status(400).json({ error: "Email required" })
            }

            const result = await this.forgotPasswordSendMail.execute(email)
            if (result.success) {
                return res.status(200).json({ success: true, message: result.message })
            } else {
                return res.status(400).json({ success: false, error: result.error })
            }
        } catch (error) {
            console.error("Error from handleForgotPasswordMailService controller", error)
            res.status(500).json({ error: 'Server Error' })
        }
    }

    async verifyForgotPasswordMail(req: Request, res: Response) {
        try {
            const { token } = req.query
            if (!token) {
                return res.redirect(`${process.env.REDIRECT_URL}/forgot-Password?error=${"No token provided"}&step=1`)
            }
            const result = await this.VerifyForgotPasswordMail.execute(token as string)
            if (!result.success) {
                return res.redirect(`${process.env.REDIRECT_URL}/forgot-Password?error=${result.error}&step=1`)
            }
            return res.redirect(`${process.env.REDIRECT_URL}/forgot-Password?token=${token}&step=2`)
        } catch (error) {
            console.error('Error from verifyForgotPassword', error)
            res.status(500).json({ success: false, error: "Server error" })
        }
    }

    async forgotResetPassword(req: Request, res: Response) {
        try {
            const { password, email } = req.body
            const result = await this.ResetForgotPassword.execute(password, email)
            if (!result.success) {
                return res.status(400).json({ success: false, error: result.error })
            }

            return res.status(200).json({ success: true, message: "Password changed successfully" })
        } catch (error) {
            console.error("Error in forgotResetPassword controller", error)
            res.status(500).json({ seccess: false, error: "Server error" })
        }
    }

    async logout(req: Request, res: Response) {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
            });

            return res.status(200).json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Server Error' })
        }
    }
}

