import { inject, injectable } from "inversify";
import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";

@injectable()
export class CreateCaseUseCase {
    constructor(@inject(TYPES.CaseRepository) private caseRepository: CaseRepository) {}

    async execute(caseData: CaseProps): Promise<CaseProps> {
        if (!caseData.title || !caseData.clientName || !caseData.caseType || 
            !caseData.priority || !caseData.nextHearingDate || !caseData.description) {
            throw new Error("All required fields must be provided");
        }
        return await this.caseRepository.create(caseData);
    }
}