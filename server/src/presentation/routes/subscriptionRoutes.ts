import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { SubscriptionController } from '../../presentation/controllers/subscriptioncontroller';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const subscriptionController = container.get<SubscriptionController>(TYPES.SubscriptionController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Subscription route accessed: ${req.method} ${req.path}`, {
        ip: req.ip,
        query: req.query,
        body: req.body,
    });
    next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('advocate'))

router.post('/', asyncHandler(subscriptionController.createSubscription.bind(subscriptionController)));

router.get('/getAll', asyncHandler(subscriptionController.getAllSubscriptions.bind(subscriptionController)));

router.get('/', asyncHandler(subscriptionController.getSubscription.bind(subscriptionController)));

export default router;