import { inject, injectable } from "inversify";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";
import { ICreateCaseUsecase } from "../../../application/interface/case/CreateCaseUsecaseRepo";

@injectable()
export class CreateCaseUseCase implements ICreateCaseUsecase {
    constructor(
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository
    ) {}

    async execute(caseData: CaseProps): Promise<CaseProps> {
        if (!caseData.title || !caseData.clientName || !caseData.caseType || 
            !caseData.priority || !caseData.nextHearingDate || !caseData.description) {
            throw new Error("All required fields must be provided");
        }
        return await this._caseRepository.create(caseData);
    }
}