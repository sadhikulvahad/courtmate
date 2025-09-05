import { CaseProps } from "../../../domain/types/EntityProps"


export interface IUpdateCaseUsecase {
    execute(id: string, caseData: Partial<CaseProps>): Promise<CaseProps>
}