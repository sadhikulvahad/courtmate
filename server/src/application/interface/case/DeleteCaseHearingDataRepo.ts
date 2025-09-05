import { ReturnDTO } from "../../../application/dto";


export interface IDeleteCaseHearingRepo {
    execute(caseId: string): Promise<ReturnDTO>
}