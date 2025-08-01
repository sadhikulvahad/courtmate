import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { UserRepository } from '../../domain/interfaces/UserRepository';
import { EmailService } from '../../domain/interfaces/EmailService';
import { HashPassword } from '../../infrastructure/services/passwordHash';
import { JwtTokenService } from '../../infrastructure/services/jwt';
import { SignupUser } from '../../application/useCases/auth/SignupUser';
import { verifyEmail } from '../../application/useCases/auth/VerifyEmail';
import { LoginUser } from '../../application/useCases/auth/LoginUser';
import { GoogleAuth } from '../../application/useCases/auth/GoogleAuth';
import { forgotPasswordSendMail } from '../../application/useCases/auth/ForgotPasswordSendMail';
import { VerifyForgotPasswordMail } from '../../application/useCases/auth/VerifyForgotPasswordMail';
import { ResetForgotPassword } from '../../application/useCases/auth/ResetForgotPassword';
import { RefreshTokenUseCase } from '../../application/useCases/auth/RefreshTokenUseCase';
import { User } from '../../domain/entities/User';
import { HttpStatus } from '../../domain/share/enums';
import { Logger } from 'winston';
import passport from 'passport';
import { TYPES } from '../../types';
import { LogoutUseCase } from '../../application/useCases/auth/LogoutUseCase';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.HashPasswordService) private hashPasswordService: HashPassword,
    @inject(TYPES.EmailService) private emailService: EmailService,
    @inject(TYPES.JwtTokenService) private jwtService: JwtTokenService,
    @inject(TYPES.SignupUser) private signupUser: SignupUser,
    @inject(TYPES.VerifyEmail) private verifyEmail: verifyEmail,
    @inject(TYPES.LoginUser) private loginUser: LoginUser,
    @inject(TYPES.GoogleAuth) private googleAuth: GoogleAuth,
    @inject(TYPES.ForgotPasswordSendMail) private forgotPasswordSendMail: forgotPasswordSendMail,
    @inject(TYPES.VerifyForgotPasswordMail) private VerifyForgotPasswordMail: VerifyForgotPasswordMail,
    @inject(TYPES.ResetForgotPassword) private resetForgotPassword: ResetForgotPassword,
    @inject(TYPES.RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase,
    @inject(TYPES.LogoutUseCase) private logoutUsecase: LogoutUseCase,
    @inject(TYPES.Logger) private logger: Logger
  ) { }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Refresh token required' });
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);
      if (!result.success) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: 'Token revoked',
          code: 'TOKEN_INVALID'
        });
      }

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.header('x-access-token', result.accessToken);

      return res.json({ accessToken: result.accessToken });
    } catch (error: unknown) {
      this.logger.error('Error in refreshToken', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server Error' });
    }
  }

  async handleGoogleAuth(req: Request, res: Response) {
    try {
      const role = req.query.role || 'user';
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: JSON.stringify({ role }),
        session: false
      })(req, res);
    } catch (error: unknown) {
      this.logger.error('Error in handleGoogleAuth', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server Error' });
    }
  }

  async handleGoogleCallback(req: Request, res: Response) {
    try {
      const user = req?.user as unknown as User;

      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'User is missing' })
      }

      const accessToken = await this.jwtService.generateToken(user.id, user.role, user.name);
      const refreshToken = await this.jwtService.generateRefreshToken(user.id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });

      res.redirect(`${process.env.REDIRECT_URL}/signup?token=${accessToken}&email=${user.email}`);
    } catch (error: unknown) {
      this.logger.error('Error in handleGoogleCallback', { error });
      res.redirect(`${process.env.REDIRECT_URL}/signup?error=AuthenticationFailed`);
    }
  }

  async handleSignup(req: Request, res: Response) {
    try {
      const { name, email, phone, password, role } = req.body;
      if (!name || !email || !phone || !password || !role) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'All fields are required' });
      }

      if (!['user', 'advocate'].includes(role)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Invalid role' });
      }

      const result = await this.signupUser.execute({
        name,
        email,
        phone,
        password,
        role
      });

      if (!result.success) {
        const statusCode = result.error === 'PENDING_ACTIVATION' ? HttpStatus.Accepted : HttpStatus.BAD_REQUEST;
        return res.status(statusCode).json({ success: false, error: result.error });
      }

      const verificationToken = this.jwtService.generateEmailVerificationToken(email);
      await this.emailService.sendVerificationEmail(email, verificationToken);
      return res.status(HttpStatus.CREATED).json({ success: true, message: 'Verification Email sent' });
    } catch (error: unknown) {
      this.logger.error('Error in handleSignup', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server Error' });
    }
  }

  async verifyEmailController(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Invalid token, please check your email' });
      }

      const result = await this.verifyEmail.execute(token);
      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Email' });
      }

      return res.status(HttpStatus.CREATED).json({ message: 'Email verified successfully' });
    } catch (error: unknown) {
      this.logger.error('Error in verifyEmailController', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Server error' });
    }
  }

  async handleLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'All fields are required' });
      }

      const result = await this.loginUser.execute(email, password);

      if ('error' in result) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ error: result.error });
      }

      res
        .cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/'
        })
        .header('x-access-token', result.token)
        .status(HttpStatus.OK)
        .json({
          message: 'Logged successfully',
          token: result.token,
          user: result.user
        });
    } catch (error: unknown) {
      this.logger.error('Error in handleLogin', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Server Error' });
    }
  }

  async handleForgotPasswordMailService(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Email required' });
      }

      const result = await this.forgotPasswordSendMail.execute(email);
      if (result.success) {
        return res.status(HttpStatus.OK).json({ success: true, message: result.message });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
      }
    } catch (error: unknown) {
      this.logger.error('Error in handleForgotPasswordMailService', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Server Error' });
    }
  }

  async verifyForgotPasswordMail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.redirect(`${process.env.REDIRECT_URL}/forgot-Password?error=${'No token provided'}&step=1`);
      }
      const result = await this.VerifyForgotPasswordMail.execute(token as string);
      if (!result.success) {
        return res.redirect(`${process.env.REDIRECT_URL}/forgot-Password?error=${result.error}&step=1`);
      }
      return res.redirect(`${process.env.REDIRECT_URL}/forgot-Password?token=${token}&step=2`);
    } catch (error: unknown) {
      this.logger.error('Error in verifyForgotPasswordMail', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server error' });
    }
  }

  async forgotResetPassword(req: Request, res: Response) {
    try {
      const { password, email } = req.body;

      if (!password || !email) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'All fields are required' });
      }
      const result = await this.resetForgotPassword.execute(password, email);
      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
      }

      return res.status(HttpStatus.OK).json({ success: true, message: 'Password changed successfully' });
    } catch (error: unknown) {
      this.logger.error('Error in forgotResetPassword', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server error' });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { token } = req.body

      if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Token is missing' })
      }

      const result = await this.logoutUsecase.execute(token)

      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Something Wrong in logging out', success: false })
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
      });

      return res.status(HttpStatus.OK).json({ success: true, message: 'Logged out successfully' });
    } catch (error: unknown) {
      this.logger.error('Error in logout', { error });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server Error' });
    }
  }
}