import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { paymentController } from '../controllers/paymentController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const PaymentController = container.get<paymentController>(TYPES.PaymentController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Payment route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(PaymentController.handleStripeWebhook.bind(PaymentController))
);

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('user', 'advocate'))

router.post('/create-checkout-session', asyncHandler(PaymentController.createCheckoutSessionController.bind(PaymentController)));

router.post('/create-subscription-checkout', asyncHandler(PaymentController.createSubscriptionCheckoutSessionController.bind(PaymentController)));



export default router;