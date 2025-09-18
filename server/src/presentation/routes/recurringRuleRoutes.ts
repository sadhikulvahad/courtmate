import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { RecurringRuleController } from '../controllers/recurringRuleController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const recurringRuleController = container.get<RecurringRuleController>(TYPES.RecurringRuleController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Recurring rule route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('advocate','user'))

router.post('/', asyncHandler(recurringRuleController.addRecurringRule.bind(recurringRuleController)));

router.get('/', asyncHandler(recurringRuleController.getRecurringRule.bind(recurringRuleController)));

export default router;