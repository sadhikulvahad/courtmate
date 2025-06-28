import { Request, Response } from "express";
import { SubscriptionRepositoryImpl } from "../../infrastructure/dataBase/repositories/SubscriptionRepository";
import { CreateSubscriptionUseCase } from "../../application/useCases/subscription/CreateSubscriptionUsecase";
import { GetSubscriptionUseCase } from "../../application/useCases/subscription/GetSubscriptionUsecase";
import { GetAllSubscriptionsUseCase } from "../../application/useCases/subscription/GetAllSubscriptionsUsecase";
import { UserRepositoryImplement } from "../../infrastructure/dataBase/repositories/userRepository";


const repository = new SubscriptionRepositoryImpl();
const userRepository = new UserRepositoryImplement()

export class SubscriptionController {
    private createSubscriptionUseCase = new CreateSubscriptionUseCase(repository, userRepository);
    private getSubscriptionUseCase = new GetSubscriptionUseCase(repository);
    private getAllSubscriptionsUseCase = new GetAllSubscriptionsUseCase(repository);

    async createSubscription(req: Request, res: Response) {
        try {
            const data = req.body;
            const result = await this.createSubscriptionUseCase.execute(data);
            console.log(result)
            res.status(201).json(result);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSubscription(req: Request, res: Response) {
        try {
            const { advocateId } = req.params;
            const result = await this.getSubscriptionUseCase.execute(advocateId);
            if (!result) return res.status(404).json({ message: "Subscription not found" });
            res.status(200).json(result);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
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
            res.status(200).json(plans);
        } catch (error: any) {
            console.error(error);
            res.status(500).json({ message: error.message || "Internal server error" });
        }
    }
}
