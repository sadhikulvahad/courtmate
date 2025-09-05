import { Router, Request, Response, NextFunction } from 'express';
import { BookingController } from '../controllers/bookingController';
import { AuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { container } from '../../infrastructure/DIContainer/container';
import { TYPES } from '../../types';
import { Logger } from 'winston';


const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const router = Router();

const bookingController = container.get<BookingController>(TYPES.BookingController);
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
router.use(authMiddleware.authorizeRoles('user', 'advocate'))

router.get('/', asyncHandler(bookingController.getBookSlot.bind(bookingController)))

router.get('/advocateBooking', asyncHandler(bookingController.getAdvocateBookings.bind(bookingController)))

router.put('/postpone', asyncHandler(bookingController.postPoneBookedSlot.bind(bookingController)))

router.get('/verify', asyncHandler(bookingController.verifyRoom.bind(bookingController)))

router.get('/getBook', asyncHandler(bookingController.getBook.bind(bookingController)))

router.get('/callHistory', asyncHandler(bookingController.callHistory.bind(bookingController)))

router.put('/cancel', asyncHandler(bookingController.cancelBooking.bind(bookingController)))


export default router