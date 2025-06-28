import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";

export class GetAllCasesUseCase {
    constructor(private caseRepository: CaseRepository) {}

    async execute(userId: string ): Promise<CaseProps[]> {
        return await this.caseRepository.findAll(userId);
    }
}