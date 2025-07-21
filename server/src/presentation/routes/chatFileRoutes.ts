import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { ChatFileController } from 'presentation/controllers/chatFileController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { MulterService } from '../../infrastructure/web/multer';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();
const chatFileController = container.get<ChatFileController>(TYPES.ChatFileController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const multerService = container.get<MulterService>(TYPES.MulterService);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Chat file route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('user', 'advocate'))

router.post('/upload', multerService.getChatMediaUpload(), asyncHandler(chatFileController.uploadFile.bind(chatFileController)));

export default router;