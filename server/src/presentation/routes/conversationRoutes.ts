import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { ConversationController } from '../controllers/conversationController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const conversationController = container.get<ConversationController>(TYPES.ConversationController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Conversation route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('user', 'advocate'))

router.post('/', asyncHandler(conversationController.createConversation.bind(conversationController)));

router.get('/', asyncHandler(conversationController.getConversation.bind(conversationController)));

router.get('/messages', asyncHandler(conversationController.getMessages.bind(conversationController)));

export default router;