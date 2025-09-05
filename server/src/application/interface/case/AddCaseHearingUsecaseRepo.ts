import { ReturnDTO } from "application/dto";
import { HearingDetailsProps } from "../../../domain/types/EntityProps";


export interface IAddCaseHearing {
    execute(hearingData: HearingDetailsProps): Promise<ReturnDTO>
}