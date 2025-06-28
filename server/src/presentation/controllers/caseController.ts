import { Request, Response } from "express";
import { CreateCaseUseCase } from "../../application/useCases/case/CreateCaseUsecase";
import { GetAllCasesUseCase } from "../../application/useCases/case/GetAllCasesUsecase";
import { UpdateCaseUseCase } from "../../application/useCases/case/UpdateCaseUsecase";
import { DeleteCaseUseCase } from "../../application/useCases/case/DeleteCaseUsecase";
import { CaseRepository } from "../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../domain/types/EntityProps";
import { UpdateHearingHistoryUseCase } from "../../application/useCases/case/updateHearingUsecase";

export class CaseController {
    private createCaseUseCase: CreateCaseUseCase;
    private getAllCasesUseCase: GetAllCasesUseCase;
    private updateCaseUseCase: UpdateCaseUseCase;
    private deleteCaseUseCase: DeleteCaseUseCase;
    private updateHearingHistoryUseCase: UpdateHearingHistoryUseCase

    constructor(caseRepository: CaseRepository) {
        this.createCaseUseCase = new CreateCaseUseCase(caseRepository);
        this.getAllCasesUseCase = new GetAllCasesUseCase(caseRepository);
        this.updateCaseUseCase = new UpdateCaseUseCase(caseRepository);
        this.deleteCaseUseCase = new DeleteCaseUseCase(caseRepository);
        this.updateHearingHistoryUseCase = new UpdateHearingHistoryUseCase(caseRepository)
    }

    async createCase(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string } | undefined;

            if (!user) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }

            const caseDataFromClient = req.body;

            // Add advocateId from logged-in user
            const caseData: CaseProps = {
                ...caseDataFromClient,
                advocateId: user.id, // assuming advocate is logged in
            };

            const newCase = await this.createCaseUseCase.execute(caseData);

            res.status(201).json({ success: true, data: newCase });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }


    async getAllCase(req: Request, res: Response) {
        try {
            const { userId } = req.params
            if (!userId) {
                return res.status(404).json({ status: false, error: 'Invalid Id' })
            }
            const cases = await this.getAllCasesUseCase.execute(userId);
            res.status(200).json({ success: true, data: cases });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async UpdateCase(req: Request, res: Response) {
        try {
            const caseId = req.params.caseId;
            const caseData = req.body as Partial<CaseProps>;
            const updatedCase = await this.updateCaseUseCase.execute(caseId, caseData);
            res.status(200).json({ success: true, data: updatedCase });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async Deletecase(req: Request, res: Response) {
        try {
            const caseId = req.params.caseId;
            await this.deleteCaseUseCase.execute(caseId);
            res.status(200).json({ success: true, message: "Case deleted successfully" });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async updateHearingDate(req: Request, res: Response) {
        try {
            const caseId = req.params.caseId;
            const { hearingEntry } = req.body;
            console.log(hearingEntry)
            const updatedCase = await this.updateHearingHistoryUseCase.execute(caseId, hearingEntry);
            res.status(200).json({ success: true, data: updatedCase });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}