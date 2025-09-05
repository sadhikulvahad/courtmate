import { HearingDetailsProps } from "../../../domain/types/EntityProps";


export interface IGetCaseHearingRepo {
    execute(caseId: string): Promise<HearingDetailsProps[]>
}