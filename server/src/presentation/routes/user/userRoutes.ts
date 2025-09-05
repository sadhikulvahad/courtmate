import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../infrastructure/DIContainer/container';
import { TYPES } from '../../../types';
import { UserController } from '../../controllers/user/userController';
import { AuthMiddleware } from '../../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

// Log middleware actions
router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`User route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))

router.put(
  '/toggleUser',
  authMiddleware.authorizeRoles('admin'),
  asyncHandler(userController.toggleUserisBlocked.bind(userController))
);

router.put(
  '/resetPassword',
  authMiddleware.authorizeRoles('user'),
  asyncHandler(userController.resetPassword.bind(userController))
);

router.put(
  '/toggleSave',
  authMiddleware.authorizeRoles('user'),
  asyncHandler(userController.toggleSaveAdvocate.bind(userController))
);

router.get(
  '/savedAdvocates',
  authMiddleware.authorizeRoles('user'),
  asyncHandler(userController.getSavedAdvocates.bind(userController))
);

export default router;