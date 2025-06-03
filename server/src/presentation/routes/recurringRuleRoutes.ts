import { Router, Request, Response } from 'express';
import { JwtTokenService } from '../../infrastructure/services/jwt';
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase';
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository';
import { MongooseSlotRepository } from '../../infrastructure/dataBase/repositories/SlotRepository';
import { RecurringRuleRepositoryImplement } from '../../infrastructure/dataBase/repositories/RecurringRuleRepository';
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { AddRecurringRule } from '../../application/useCases/recurringRule/AddRecurringRule';
import { RecurringRuleController } from '../controllers/recurringRuleController';
import { GetRecurringRulesByAdvocate } from '../../application/useCases/recurringRule/GetRecurringRule';

// Factory function to create the router with dependencies
    const router = Router();

    // Initialize dependencies
    const tokenService = new JwtTokenService();
    const userRepository = new UserRepositoryImplement();
    const slotRepository = new MongooseSlotRepository();
    const recurringRuleRepository = new RecurringRuleRepositoryImplement();
    const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository);
    const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase);
    const addRecurringRuleUseCase = new AddRecurringRule(recurringRuleRepository, slotRepository);
    const getRecurringRulesByAdvocate = new GetRecurringRulesByAdvocate(recurringRuleRepository)
    const recurringRuleController = new RecurringRuleController(addRecurringRuleUseCase, getRecurringRulesByAdvocate);

    // Routes
    router.post('/', authMiddleware, (req: Request, res: Response) => {
        recurringRuleController.addRecurringRule(req, res)
    });

    router.get('/', authMiddleware, (req: Request, res: Response) => {
        recurringRuleController.getRecurringRule(req, res)
    })

export default router;