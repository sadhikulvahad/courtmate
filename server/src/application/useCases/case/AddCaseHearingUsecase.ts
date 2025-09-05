import { IAddCaseHearing } from "../../../application/interface/case/AddCaseHearingUsecaseRepo";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { HearingDetailsProps } from "../../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { ReturnDTO } from "application/dto";

@injectable()
export class AddHearingDataUsecase implements IAddCaseHearing {
    constructor(
        @inject(TYPES.ICaseRepository) private _addCaseHearing: ICaseRepository
    ) { }

    async execute(hearingData: HearingDetailsProps): Promise<ReturnDTO> {

        if (!hearingData) {
            throw new Error('HearingData is missing')
        }

        await this._addCaseHearing.addHearingData(hearingData)
        return { success: true, message: "Hearing Added successfully" }
    }
}