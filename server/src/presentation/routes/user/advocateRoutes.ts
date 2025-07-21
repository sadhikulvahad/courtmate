import Express, { NextFunction, Request, Response } from "express";
import { AdvocateController } from "../../controllers/admin/advocateController";
import { container } from "../../../infrastructure/DIContainer/container";
import { TYPES } from "../../../types";
import { Logger } from "winston";

const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Express.Router()

const advocateController = container.get<AdvocateController>(TYPES.AdvocateController)
const logger = container.get<Logger>(TYPES.Logger);

router.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Profile route accessed: ${req.method} ${req.path}`, {
        ip: req.ip,
        query: req.query,
        body: req.body,
    });
    next();
});

router.get('/getAdvocates', asyncHandler(advocateController.getUserAdvocates.bind(advocateController)))

router.get('/topRatedAdvocates', asyncHandler(advocateController.getTopRatedAdvocates.bind(advocateController)))

export default router