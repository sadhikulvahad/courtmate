import express, { NextFunction, Request, Response } from 'express';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { AdminDashboardController } from '../controllers/adminDashboardController';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { Logger } from 'winston';

const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router();
const adminDashboardController = container.get<AdminDashboardController>(TYPES.AdminDashboardController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Admin dashboard route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('admin'))

router.get('/', asyncHandler(adminDashboardController.getAdminDashboardData.bind(adminDashboardController)));

export default router;