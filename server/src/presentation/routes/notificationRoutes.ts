import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { NotificationController } from '../controllers/admin/notificationController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const notificationController = container.get<NotificationController>(TYPES.NotificationController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Notification route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('admin', 'advocate', 'user'))

router.get('/', asyncHandler(notificationController.getAdminNotifications.bind(notificationController)));

router.put('/markAsRead', asyncHandler(notificationController.markAsRead.bind(notificationController)));

router.put('/markAllAsRead', asyncHandler(notificationController.markAllAsRead.bind(notificationController)));

export default router;