import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../../../infrastructure/DIContainer/container';
import { TYPES } from '../../../types';
import { advProfileController } from '../../../presentation/controllers/advocate/advProfileController';
import { AuthMiddleware } from '../../../infrastructure/web/authMiddlware';
import { MulterService } from '../../../infrastructure/web/multer';
import { Logger } from 'winston';

// Async handler wrapper
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();

const profileController = container.get<advProfileController>(TYPES.AdvProfileController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const multerService = container.get<MulterService>(TYPES.MulterService);
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Profile route accessed: ${req.method} ${req.path}`, {
    ip: req.ip,
    query: req.query,
    body: req.body,
  });
  next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('advocate', 'user'))

router.get('/getUser', asyncHandler(profileController.getUser.bind(profileController)));
router.get('/details', asyncHandler(profileController.getAdvocateDetail.bind(profileController)));
router.put('/updateAdvProfile', multerService.getProfileUpload(), asyncHandler(profileController.updateAdvocateProfile.bind(profileController)));
router.put('/updateAdvocate', multerService.getProfileUpload(), asyncHandler(profileController.updateAdvocate.bind(profileController)));

export default router;