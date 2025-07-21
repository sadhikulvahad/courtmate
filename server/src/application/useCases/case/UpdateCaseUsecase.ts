import { inject, injectable } from "inversify";
import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";


@injectable()
export class UpdateCaseUseCase {
    constructor(@inject(TYPES.CaseRepository) private caseRepository: CaseRepository) { }

    async execute(id: string, caseData: Partial<CaseProps>): Promise<CaseProps> {
        const updatedCase = await this.caseRepository.update(id, caseData);
        if (!updatedCase) {
            throw new Error("Case not found");
        }
        return updatedCase;
    }
}