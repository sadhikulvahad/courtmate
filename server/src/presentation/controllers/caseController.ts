import { Request, Response } from "express";
import { CaseProps } from "../../domain/types/EntityProps";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";
import { ICreateCaseUsecase } from "../../application/interface/case/CreateCaseUsecaseRepo";
import { IGetAllCasesUsecase } from "../../application/interface/case/GetAllCasesUsecaseRepo";
import { IUpdateCaseUsecase } from "../../application/interface/case/UpdateCaseUsecaseRepo";
import { IDeleteCaseUsecase } from "../../application/interface/case/DeleteCaseUsecaseRepo";
import { IUpdateHearingUsecase } from "../../application/interface/case/UpdateHearingUsecaseRepo";
import { IAddCaseHearing } from "../../application/interface/case/AddCaseHearingUsecaseRepo";
import { IGetCaseHearingRepo } from "../../application/interface/case/GetCaseHearingDataRepo";
import { IUpdateCaseHearingDataRepo } from "../../application/interface/case/UpdateCaseHearingDataRepo";
import { IDeleteCaseHearingRepo } from "../../application/interface/case/DeleteCaseHearingDataRepo";


@injectable()
export class CaseController {
    constructor(
        @inject(TYPES.ICreateCaseUseCase) private _createCaseUseCase: ICreateCaseUsecase,
        @inject(TYPES.IGetAllCasesUseCase) private _getAllCasesUseCase: IGetAllCasesUsecase,
        @inject(TYPES.IUpdateCaseUseCase) private _updateCaseUseCase: IUpdateCaseUsecase,
        @inject(TYPES.IDeleteCaseUseCase) private _deleteCaseUseCase: IDeleteCaseUsecase,
        @inject(TYPES.IUpdateHearingUsecase) private _updateHearingHistoryUseCase: IUpdateHearingUsecase,
        @inject(TYPES.IAddCaseHearing) private _addCaseHearingUsecase: IAddCaseHearing,
        @inject(TYPES.IGetCaseHearingRepo) private _getCaseHearingUsecase: IGetCaseHearingRepo,
        @inject(TYPES.IUpdateCaseHearingDataRepo) private _updatecaseHearingRepo: IUpdateCaseHearingDataRepo,
        @inject(TYPES.IDeleteCaseHearingRepo) private _deleteCaseHearingRepo: IDeleteCaseHearingRepo,
        @inject(TYPES.Logger) private _logger: Logger
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

            const newCase = await this._createCaseUseCase.execute(caseData);

            res.status(HttpStatus.CREATED).json({ success: true, data: newCase });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }


    async getAllCase(req: Request, res: Response) {
        try {
            const { userId } = req.query
            if (!userId) {
                return res.status(HttpStatus.NOT_FOUND).json({ status: false, error: 'Invalid Id' })
            }
            const cases = await this._getAllCasesUseCase.execute(userId.toString());
            res.status(HttpStatus.OK).json({ success: true, data: cases });
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    async UpdateCase(req: Request, res: Response) {
        try {
            const { caseId } = req.query

            if (!caseId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Case Id required' });
            }

            const caseData = req.body 
            if (!caseData) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'All fields are required' });
            }
            const updatedCase = await this._updateCaseUseCase.execute(caseId.toString(), caseData);
            res.status(HttpStatus.OK).json({ success: true, data: updatedCase });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async Deletecase(req: Request, res: Response) {
        try {
            const { caseId } = req.query;

            if (!caseId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Case Id required' });
            }

            await this._deleteCaseUseCase.execute(caseId.toString());
            res.status(HttpStatus.OK).json({ success: true, message: "Case deleted successfully" });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async updateHearingDate(req: Request, res: Response) {
        try {
            const { caseId } = req.query;

            if (!caseId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Case Id required' });
            }

            const { hearingEntry } = req.body;

            if (!hearingEntry) {
                return res.status(HttpStatus.BAD_REQUEST).json({ error: 'All fields are required' });
            }

            const updatedCase = await this._updateHearingHistoryUseCase.execute(caseId.toString(), hearingEntry);
            res.status(HttpStatus.OK).json({ success: true, data: updatedCase });
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async addHearingData(req: Request, res: Response) {
        try {
            const {
                caseId,
                advocateId,
                date,
                time,
                courtName,
                courtRoom,
                judgeName,
                status,
                nextHearingDate,
                hearingOutcome,
                isClosed,
                advocateNotes,
                clientInstructions,
                documentsSubmitted,
                clientId
            } = req.body

            if (!caseId || !advocateId) {
                return res.status(HttpStatus.FORBIDDEN).json({ success: false, error: 'caseId or AdvocateId missing' })
            }

            if (
                !date ||
                !time ||
                !status ||
                !courtName ||
                !courtRoom ||
                !judgeName ||
                !hearingOutcome
            ) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Fill Required fields' })
            }

            const data = await this._addCaseHearingUsecase.execute({
                caseId,
                advocateId,
                date,
                time,
                courtName,
                courtRoom,
                judgeName,
                status,
                nextHearingDate,
                hearingOutcome,
                isClosed,
                advocateNotes,
                clientInstructions,
                documentsSubmitted,
                clientId
            })

            if (data.success) {
                return res.status(HttpStatus.CREATED).json({ success: true, message: data.message })
            }

            return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: data.error })

        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async updateHearingData(req: Request, res: Response) {
        try {
            const {
                caseId,
                advocateId,
                date,
                time,
                courtName,
                courtRoom,
                judgeName,
                status,
                nextHearingDate,
                hearingOutcome,
                isClosed,
                advocateNotes,
                clientInstructions,
                documentsSubmitted,
                clientId
            } = req.body

            const { hearingId } = req.query

            if (!hearingId || !caseId || !advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: 'Required fileds are missing' })
            }

            if (
                !date ||
                !time ||
                !status ||
                !courtName ||
                !courtRoom ||
                !judgeName ||
                !hearingOutcome
            ) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Fill Required fields' })
            }

            const data = await this._updatecaseHearingRepo.execute({
                caseId,
                advocateId,
                date,
                time,
                courtName,
                courtRoom,
                judgeName,
                status,
                nextHearingDate,
                hearingOutcome,
                isClosed,
                advocateNotes,
                clientInstructions,
                documentsSubmitted,
                clientId
            }, hearingId.toString())

            return res.status(HttpStatus.OK).json({ status: true, message: 'Hearing Updated Successfully', Hearing: data })

        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async deleteHearingData(req: Request, res: Response) {
        try {
            const { hearingId } = req.query

            if (!hearingId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: 'Hearing Id is missing' })
            }

            const data = await this._deleteCaseHearingRepo.execute(hearingId.toString())

            if (data.success) {
                return res.status(HttpStatus.OK).json({ status: true, message: 'Hearing Data Deleted successfully' })
            }
            res.status(HttpStatus.OK).json({ status: true, error: data.error })
        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    async getHearingData(req: Request, res: Response) {
        try {
            const { caseId } = req.query

            if (!caseId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: 'CaseId is missing' })
            }

            const data = await this._getCaseHearingUsecase.execute(caseId.toString())

            return res.status(HttpStatus.Accepted).json({ status: true, message: 'Hearing Data fetched successfully', hearingData: data })

        } catch (error: any) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }
}