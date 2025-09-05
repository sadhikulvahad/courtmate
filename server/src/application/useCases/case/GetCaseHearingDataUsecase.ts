import { IGetCaseHearingRepo } from "../../../application/interface/case/GetCaseHearingDataRepo";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { HearingDetailsProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class GetCaseHearingDataUsecase implements IGetCaseHearingRepo {
    constructor(
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository
    ) { }

    async execute(caseId: string): Promise<HearingDetailsProps[]> {
        if (!caseId) {
            throw new Error('CaseId is missing')
        }

        return await this._caseRepository.getHearingData(caseId)

    }
}