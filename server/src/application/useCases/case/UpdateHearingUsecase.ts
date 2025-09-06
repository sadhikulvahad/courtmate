import { inject, injectable } from "inversify";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";
import { IUpdateHearingUsecase } from "../../interface/case/UpdateHearingUsecaseRepo";


@injectable()
export class UpdateHearingHistoryUseCase implements IUpdateHearingUsecase {
    constructor(
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository
    ) { }

    async execute(id: string, hearingDate: string): Promise<CaseProps> {
        if (!hearingDate || isNaN(new Date(hearingDate).getTime())) {
            throw new Error("Valid hearing date must be provided");
        }
        const updatedCase = await this._caseRepository.addHearingDate(id, new Date(hearingDate));
        if (!updatedCase) {
            throw new Error("Case not found");
        }
        return updatedCase;
    }
}