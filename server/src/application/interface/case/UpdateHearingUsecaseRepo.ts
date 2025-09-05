import { CaseProps } from "../../../domain/types/EntityProps";



export interface IUpdateHearingUsecase {
    execute(id: string, hearingDate: string): Promise<CaseProps>
}