import express, { NextFunction, Request, Response } from 'express'
import { AdvocateDashboardController } from '../controllers/advocateDashboardController'
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware'
import { container } from '../../infrastructure/DIContainer/container'
import { TYPES } from '../../types'
import { Logger } from 'winston'


const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router()

const advocateDashboardController = container.get<AdvocateDashboardController>(TYPES.AdvocateDashboardController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
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
router.use(authMiddleware.authorizeRoles('advocate'))

router.get('/:advocateId', asyncHandler(advocateDashboardController.getAdvocateDashboardData.bind(advocateDashboardController)))

export default router