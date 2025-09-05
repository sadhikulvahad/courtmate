import { CaseProps } from "../../../domain/types/EntityProps";


export interface IGetAllCasesUsecase {
    execute(token: string): Promise<CaseProps[]>
}