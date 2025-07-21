import { inject, injectable } from "inversify";
import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";


@injectable()
export class UpdateHearingHistoryUseCase {
    constructor(@inject(TYPES.CaseRepository) private caseRepository: CaseRepository) { }

    async execute(id: string, hearingDate: string): Promise<CaseProps> {
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