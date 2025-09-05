import express, { NextFunction, Request, Response } from "express";
import { container } from "../../infrastructure/DIContainer/container";
import { FilterController } from "../../presentation/controllers/filterController";
import { TYPES } from "../../types";
import { AuthMiddleware } from "../../infrastructure/web/authMiddlware";
import { Logger } from "winston";


const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router()

const filterController = container.get<FilterController>(TYPES.FilterController)
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware)
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
router.use(authMiddleware.authorizeRoles('admin', 'user', 'advocate'))


router.get('/', asyncHandler(filterController.getAllFilters.bind(filterController)))

router.post('/', asyncHandler(filterController.addFilter.bind(filterController)))

router.put('/', asyncHandler(filterController.addCategory.bind(filterController)))

router.delete('/', asyncHandler(filterController.deleteFilter.bind(filterController)))

router.put('/category', asyncHandler(filterController.deleteCategory.bind(filterController)))

export default router