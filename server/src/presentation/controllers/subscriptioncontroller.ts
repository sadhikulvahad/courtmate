import { Request, Response } from "express";
import { SubscriptionRepositoryImpl } from "../../infrastructure/dataBase/repositories/SubscriptionRepository";
import { CreateSubscriptionUseCase } from "../../application/useCases/subscription/CreateSubscriptionUsecase";
import { GetSubscriptionUseCase } from "../../application/useCases/subscription/GetSubscriptionUsecase";
import { GetAllSubscriptionsUseCase } from "../../application/useCases/subscription/GetAllSubscriptionsUsecase";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/UserRepository";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


@injectable()
export class SubscriptionController {

    constructor(
        @inject(TYPES.CreateSubscriptionUseCase) private createSubscriptionUseCase: CreateSubscriptionUseCase,
        @inject(TYPES.GetSubscriptionUseCase) private getSubscriptionUseCase: GetSubscriptionUseCase,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async createSubscription(req: Request, res: Response) {
        try {
            const data = req.body;

            if (!data) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Required Data are missing' });
            }

            const result = await this.createSubscriptionUseCase.execute(data);
            res.status(HttpStatus.CREATED).json(result);
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async getSubscription(req: Request, res: Response) {
        try {
            const { advocateId } = req.params;

            if (!advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'advocateId required' });
            }

            const result = await this.getSubscriptionUseCase.execute(advocateId);
            if (!result) return res.status(HttpStatus.NOT_FOUND).json({ message: "Subscription not found" });
            res.status(HttpStatus.OK).json(result);
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }

    async getAllSubscriptions(req: Request, res: Response) {
        try {
            // For simplicity, return a static list of plans since the schema doesn't store plan metadata
            const plans = [
                {
                    _id: "basic-plan-id",
                    plan: "basic",
                    price: 29,
                    billingCycle: "monthly",
                    features: ["50 case searches/month", "Basic document templates", "Email support"],
                },
                {
                    _id: "professional-plan-id",
                    plan: "professional",
                    price: 99,
                    billingCycle: "monthly",
                    features: [
                        "Unlimited case searches",
                        "Advanced document generation",
                        "AI legal assistant",
                        "Priority support",
                    ],
                },
                {
                    _id: "enterprise-plan-id",
                    plan: "enterprise",
                    price: 299,
                    billingCycle: "monthly",
                    features: [
                        "Everything in Professional",
                        "Team collaboration tools",
                        "Custom integrations",
                        "Dedicated account manager",
                    ],
                },
            ];
            res.status(HttpStatus.OK).json(plans);
        } catch (error: any) {
            this.logger.error({ error })
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal server error" });
        }
    }
}
