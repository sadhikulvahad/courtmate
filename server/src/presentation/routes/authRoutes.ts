import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { AuthController } from '../controllers/authController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';
import passport from 'passport';

// Async handler wrapper to handle promises in Express routes
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

// Log middleware actions
router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Auth route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

// Public routes
router.post('/signup', asyncHandler(authController.handleSignup.bind(authController)));
router.post('/login', asyncHandler(authController.handleLogin.bind(authController)));
router.post('/verify-email', asyncHandler(authController.verifyEmailController.bind(authController)));
router.post('/forgot-password', asyncHandler(authController.handleForgotPasswordMailService.bind(authController)));
router.get('/verify-forgotPassword', asyncHandler(authController.verifyForgotPasswordMail.bind(authController)));
router.put('/forgot-resetPassword', asyncHandler(authController.forgotResetPassword.bind(authController)));

// Google OAuth routes
router.get(
  '/google',
  (req: Request, res: Response, next: NextFunction) => {
    const role = req.query.role || 'user';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: JSON.stringify({ role }),
      session: false,
    })(req, res, next);
  }
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  asyncHandler(authController.handleGoogleCallback.bind(authController))
);

// Protected routes
router.post('/refresh', authMiddleware.auth.bind(authMiddleware), asyncHandler(authController.refreshToken.bind(authController)));
router.post('/logout', authMiddleware.auth.bind(authMiddleware), asyncHandler(authController.logout.bind(authController)));

export default router;