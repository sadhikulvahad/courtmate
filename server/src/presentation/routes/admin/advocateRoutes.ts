import Express, { NextFunction, Request, Response } from "express";
import { AdvocateController } from "../../controllers/admin/advocateController";
import { AuthMiddleware } from "../../../infrastructure/web/authMiddlware";
import { container } from "../../../infrastructure/DIContainer/container";
import { TYPES } from "../../../types";
import { Logger } from "winston";


const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Express.Router()

const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
const logger = container.get<Logger>(TYPES.Logger);
const advocateController = container.get<AdvocateController>(TYPES.AdvocateController)


router.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Profile route accessed: ${req.method} ${req.path}`, {
        ip: req.ip,
        query: req.query,
        body: req.body,
    });
    next();
});

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('admin'))

router.get("/getAdvocates", asyncHandler(advocateController.getAdminAdvocates.bind(advocateController))
);

router.put('/statusUpdate', asyncHandler(advocateController.advocateStatusUpdate.bind(advocateController)))

export default router