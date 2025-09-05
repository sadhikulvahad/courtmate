import { CaseProps } from "../../../domain/types/EntityProps";


export interface ICreateCaseUsecase {
    execute(caseData: CaseProps): Promise<CaseProps>
}