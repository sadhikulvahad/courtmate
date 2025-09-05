import { CaseProps, HearingDetailsProps } from "../types/EntityProps";


export interface ICaseRepository {
    create(caseData: CaseProps): Promise<CaseProps>;
    findAll(userId: string): Promise<CaseProps[]>;
    findById(id: string): Promise<CaseProps | null>;
    update(id: string, caseData: Partial<CaseProps>): Promise<CaseProps | null>;
    delete(id: string): Promise<boolean>;
    addHearingDate(id: string, hearingDate: Date): Promise<CaseProps | null>;
    addHearingData(hearingData: HearingDetailsProps): Promise<HearingDetailsProps>
    getHearingData(caseId: string): Promise<HearingDetailsProps[]>
    updateHearingData(hearingId: string, hearingData: HearingDetailsProps): Promise<HearingDetailsProps | null>
    deleteHearingData(hearingId: string): Promise<void | null>
    findByCaseId(caseId: string): Promise<CaseProps | null>
}