import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";

export class UpdateHearingHistoryUseCase {
    constructor(private caseRepository: CaseRepository) {}

    async execute(id: string, hearingDate: string): Promise<CaseProps> {
        console.log(id, hearingDate)
        if (!hearingDate || isNaN(new Date(hearingDate).getTime())) {
            throw new Error("Valid hearing date must be provided");
        }
        const updatedCase = await this.caseRepository.addHearingDate(id, new Date(hearingDate));
        if (!updatedCase) {
            throw new Error("Case not found");
        }
        return updatedCase;
    }
}