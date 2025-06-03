import { Router, Request, Response } from 'express';
import { SlotController } from '../controllers/slotController';
import { JwtTokenService } from '../../infrastructure/services/jwt';
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository';
import { MongooseSlotRepository } from '../../infrastructure/dataBase/repositories/SlotRepository';
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase';
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { AddSlot } from '../../application/useCases/slots/AddSlot';
import { GetSlots } from '../../application/useCases/slots/GetSlot';
const router = Router();

// Initialize dependencies
const tokenService = new JwtTokenService();
const userRepository = new UserRepositoryImplement();
const slotRepository = new MongooseSlotRepository();
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository);
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase);
const addSlotUseCase = new AddSlot(slotRepository);
const getSlotsUseCase = new GetSlots(slotRepository);
const slotController = new SlotController(getSlotsUseCase, addSlotUseCase);

// Routes
router.get('/', authMiddleware, (req: Request, res: Response) => {
    slotController.getSlots(req, res)
});
router.post('/', authMiddleware, (req: Request, res: Response) => {
    slotController.addSlot(req, res)
});


export default router