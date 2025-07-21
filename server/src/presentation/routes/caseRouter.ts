
import express, { NextFunction, Request, Response } from "express";
import { AuthMiddleware } from "../../infrastructure/web/authMiddlware";
import { CaseController } from "../controllers/caseController";
import { container } from "../../infrastructure/DIContainer/container";
import { TYPES } from "../../types";
import { Logger } from "winston";


const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router()

const caseController = container.get<CaseController>(TYPES.CaseController);
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

router.post('/', asyncHandler(caseController.createCase.bind(caseController)))

router.get('/:userId', asyncHandler(caseController.getAllCase.bind(caseController)))

router.put('/:caseId', asyncHandler(caseController.UpdateCase.bind(caseController)))

router.delete('/:caseId', asyncHandler(caseController.Deletecase.bind(caseController)))

router.put('/updateHearing/:caseId', asyncHandler(caseController.updateHearingDate.bind(caseController)))


export default router