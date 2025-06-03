import express, { Request, Response, Router } from "express";
import { paymentController } from "../controllers/paymentController";
import { RefreshTokenUseCase } from "../../application/useCases/auth/refreshTokenUseCase";
import { createAuthMiddleware } from "../../infrastructure/web/authMiddlware";
import { JwtTokenService } from "../../infrastructure/services/jwt";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/userRepository";
import { CreateCheckoutSessionUseCase } from "../../application/useCases/CreateCheckoutSessionUseCase";
import { PaymentService } from "../../infrastructure/services/stripePaymentService";
import { BookSlot } from "../../application/useCases/Booking/BookSlot";
import { BookingRepositoryImplements } from "../../infrastructure/dataBase/repositories/BookingRepository";
import { MongooseSlotRepository } from "../../infrastructure/dataBase/repositories/SlotRepository";
import { PaymentUsecase } from "../../application/useCases/PaymentUsecase";
import { PaymentRepositoryImplement } from "../../infrastructure/dataBase/repositories/PaymentRepository";

const router = Router();

const tokenService = new JwtTokenService();
const userRepository = new UserRepositoryImplement();
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository);
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase);

const paymentService = new PaymentService();
const bookingRepository = new BookingRepositoryImplements()
const slotRepository = new MongooseSlotRepository
const bookSlot = new BookSlot(bookingRepository, slotRepository)
const PaymentRepository = new PaymentRepositoryImplement()
const createCheckoutSessionUseCase = new CreateCheckoutSessionUseCase(paymentService, userRepository);
const paymentUsecase = new PaymentUsecase(PaymentRepository)
const paymentControllerInstance = new paymentController(createCheckoutSessionUseCase, bookSlot, paymentUsecase);

router.post('/create-checkout-session', authMiddleware, (req: Request, res: Response) => {
    paymentControllerInstance.createCheckoutSessionController(req, res);
});

router.post(
    "/webhook",
    express.raw({ type: "application/json" }), // Stripe requires raw body
    (req: Request, res: Response) => {
        paymentControllerInstance.handleStripeWebhook(req, res);
    }
);

export default router;
