import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { SlotController } from '../controllers/slotController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const slotController = container.get<SlotController>(TYPES.SlotController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Slot route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('user', 'advocate'))

router.get('/', asyncHandler(slotController.getSlots.bind(slotController)));

router.post('/', asyncHandler(slotController.addSlot.bind(slotController)));

router.put('/:id', asyncHandler(slotController.postponeSlot.bind(slotController)));

export default router;