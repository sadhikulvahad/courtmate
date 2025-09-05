import { ReturnDTO } from "../../../application/dto";
import { IDeleteCaseHearingRepo } from "../../../application/interface/case/DeleteCaseHearingDataRepo";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";

@injectable()
export class DeleteCaseHearingUsecase implements IDeleteCaseHearingRepo {
    constructor(
        @inject(TYPES.ICaseRepository) private _deleteCaseHearing: ICaseRepository
    ) { }

    async execute(hearingId: string): Promise<ReturnDTO> {

        if(!hearingId){
            throw new Error('Hearing Id is missing')
        }

        await this._deleteCaseHearing.deleteHearingData(hearingId)

        return { success: true, message: 'Hearing Data Deleted Successfully' }
    }
}