import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";


export class UpdateCaseUseCase {
    constructor(private caseRepository: CaseRepository) {}

    async execute(id: string, caseData: Partial<CaseProps>): Promise<CaseProps> {
        const updatedCase = await this.caseRepository.update(id, caseData);
        if (!updatedCase) {
            throw new Error("Case not found");
        }
        return updatedCase;
    }
}