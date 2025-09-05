import { HearingDetailsProps } from "../../../domain/types/EntityProps";
import { IUpdateCaseHearingDataRepo } from "../../../application/interface/case/UpdateCaseHearingDataRepo";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";


@injectable()
export class UpdateCaseHearingDataUsecase implements IUpdateCaseHearingDataRepo {
    constructor(
        @inject(TYPES.ICaseRepository) private _caseRepositroy: ICaseRepository
    ) { }

    async execute(hearingData: HearingDetailsProps, hearingId: string): Promise<HearingDetailsProps | null> {
        if (!hearingData) {
            throw new Error('Hearing Data is missing')
        }

        if (!hearingId) {
            throw new Error('hearing Id is missing')
        }

        return await this._caseRepositroy.updateHearingData(hearingId, hearingData)
    }
}