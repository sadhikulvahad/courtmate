

import Express, { NextFunction, Request, Response } from "express";
import { UserController } from "../../controllers/admin/usersController";
import { AuthMiddleware } from "../../../infrastructure/web/authMiddlware";
import { container } from "../../../infrastructure/DIContainer/container";
import { TYPES } from "../../../types";
import { Logger, query } from "winston";


const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | undefined>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}

const router = Express.Router()
const userController = container.get<UserController>(TYPES.AdminUserController)
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware)
const logger = container.get<Logger>(TYPES.Logger)

router.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`Admin User route accessed : ${req.method} ${req.path}`, {
        ip: req.ip,
        query: req.query,
        body: req.body
    })
    next()
})

router.use(authMiddleware.auth.bind(authMiddleware))
router.use(authMiddleware.authorizeRoles('admin'))

router.get('/getUsers', asyncHandler(userController.getAllUsers.bind(userController)))

export default router