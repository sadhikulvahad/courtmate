import { inject, injectable } from "inversify";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";
import { IUpdateCaseUsecase } from "../../../application/interface/case/UpdateCaseUsecaseRepo";


@injectable()
export class UpdateCaseUseCase implements IUpdateCaseUsecase {
    constructor(
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository
    ) { }

    async execute(id: string, caseData: Partial<CaseProps>): Promise<CaseProps> {
        const updatedCase = await this._caseRepository.update(id, caseData);
        if (!updatedCase) {
            throw new Error("Case not found");
        }
        return updatedCase;
    }
}