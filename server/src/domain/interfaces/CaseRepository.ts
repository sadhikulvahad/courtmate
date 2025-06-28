import { CaseProps } from "../types/EntityProps";


export interface CaseRepository {
    create(caseData: CaseProps): Promise<CaseProps>;
    findAll(userId: string): Promise<CaseProps[]>;
    findById(id: string): Promise<CaseProps | null>;
    update(id: string, caseData: Partial<CaseProps>): Promise<CaseProps | null>;
    delete(id: string): Promise<boolean>;
    addHearingDate(id: string, hearingDate: Date): Promise<CaseProps | null>;
}