import { Router, Request, Response } from 'express';
import { BookingController } from '../controllers/bookingController';
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase';
import { JwtTokenService } from '../../infrastructure/services/jwt';
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository';
import { BookSlot } from '../../application/useCases/Booking/BookSlot';
import { BookingRepositoryImplements } from '../../infrastructure/dataBase/repositories/BookingRepository';
import { MongooseSlotRepository } from '../../infrastructure/dataBase/repositories/SlotRepository';
import { GetBookSlot } from '../../application/useCases/Booking/GetBookSlot';
import { VerifyRoom } from '../../application/useCases/Booking/VerifyRoom';
import { Postpone } from '../../application/useCases/Booking/Postpone';
import { GetBookingThisHourUseCase } from '../../application/useCases/Booking/GetBook';
const router = Router();

const tokenService = new JwtTokenService()
const userRepository = new UserRepositoryImplement()
const slotRepository = new MongooseSlotRepository()
const bookingRepository = new BookingRepositoryImplements()
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository)
const authMiddleware = createAuthMiddleware(tokenService,refreshTokenUseCase)

const slot = new BookSlot(bookingRepository, slotRepository)
const getBookingSlot = new GetBookSlot(bookingRepository)
const verifyRoom = new VerifyRoom(bookingRepository)
const postpone = new Postpone(bookingRepository, slotRepository)
const getBook = new GetBookingThisHourUseCase(bookingRepository)
const bookingController = new BookingController(slot, getBookingSlot, verifyRoom, postpone,getBook)

router.get('/', authMiddleware, (req: Request, res: Response) => {
    bookingController.getBookSlot(req,res)
})

router.put('/postpone', authMiddleware, (req: Request, res: Response) => {
    bookingController.postPoneBookedSlot(req,res)
})

router.get('/verify/:roomId', authMiddleware, (req:Request, res: Response) => {
    bookingController.verifyRoom(req,res)
})

router.get('/getBook', authMiddleware, (req: Request, res: Response) => {
    bookingController.getBook(req,res)
})

router.get('/callHistory', authMiddleware, (req:Request, res: Response) => {
    bookingController.callHistory(req,res)
})


export default router