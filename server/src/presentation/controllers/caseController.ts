import { Request, Response } from "express";
import { CreateCaseUseCase } from "../../application/useCases/case/CreateCaseUsecase";
import { GetAllCasesUseCase } from "../../application/useCases/case/GetAllCasesUsecase";
import { UpdateCaseUseCase } from "../../application/useCases/case/UpdateCaseUsecase";
import { DeleteCaseUseCase } from "../../application/useCases/case/DeleteCaseUsecase";
import { CaseRepository } from "../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../domain/types/EntityProps";
import { UpdateHearingHistoryUseCase } from "../../application/useCases/case/UpdateHearingUsecase";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


@injectable()
export class CaseController {
    constructor(
        @inject(TYPES.CreateCaseUseCase) private createCaseUseCase: CreateCaseUseCase,
        @inject(TYPES.GetAllCasesUseCase) private getAllCasesUseCase: GetAllCasesUseCase,
        @inject(TYPES.UpdateCaseUseCase) private updateCaseUseCase: UpdateCaseUseCase,
        @inject(TYPES.DeleteCaseUseCase) private deleteCaseUseCase: DeleteCaseUseCase,
        @inject(TYPES.UpdateHearingHistoryUseCase) private updateHearingHistoryUseCase: UpdateHearingHistoryUseCase,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async createCase(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string } | undefined;

            if (!user) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
            }

            const caseDataFromClient = req.body;

            // Add advocateId from logged-in user
            const caseData: CaseProps = {
                ...caseDataFromClient,
                advocateId: user.id, // assuming advocate is logged in
            };

            const newCase = await this.createCaseUseCase.execute(caseData);

            res.status(HttpStatus.CREATED).json({ success: true, data: newCase });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }


    async getAllCase(req: Request, res: Response) {
        try {
            const { userId } = req.params
            if (!userId) {
                return res.status(HttpStatus.NOT_FOUND).json({ status: false, error: 'Invalid Id' })
            }
            const cases = await this.getAllCasesUseCase.execute(userId);
            res.status(HttpStatus.OK).json({ success: true, data: cases });
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    async UpdateCase(req: Request, res: Response) {
        try {
            const caseId = req.params.caseId;

            if (!caseId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Case Id required' });
            }

            const caseData = req.body as Partial<CaseProps>;

            if (!caseData) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'All fields are required' });
            }
            const updatedCase = await this.updateCaseUseCase.execute(caseId, caseData);
            res.status(HttpStatus.OK).json({ success: true, data: updatedCase });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async Deletecase(req: Request, res: Response) {
        try {
            const caseId = req.params.caseId;

            if (!caseId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Case Id required' });
            }

            await this.deleteCaseUseCase.execute(caseId);
            res.status(HttpStatus.OK).json({ success: true, message: "Case deleted successfully" });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async updateHearingDate(req: Request, res: Response) {
        try {
            const caseId = req.params.caseId;

            if (!caseId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Case Id required' });
            }

            const { hearingEntry } = req.body;

            if (!hearingEntry) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'All fields are required' });
            }

            const updatedCase = await this.updateHearingHistoryUseCase.execute(caseId, hearingEntry);
            res.status(HttpStatus.OK).json({ success: true, data: updatedCase });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }
}