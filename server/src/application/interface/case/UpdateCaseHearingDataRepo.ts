import { HearingDetailsProps } from "../../../domain/types/EntityProps";


export interface IUpdateCaseHearingDataRepo {
    execute(hearingData: HearingDetailsProps, hearingId: string): Promise<HearingDetailsProps | null>
}