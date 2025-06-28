import { CaseRepository } from "../../../domain/interfaces/CaseRepository";


export class DeleteCaseUseCase {
    constructor(private caseRepository: CaseRepository) {}

    async execute(id: string): Promise<boolean> {
        const result = await this.caseRepository.delete(id);
        if (!result) {
            throw new Error("Case not found");
        }
        return result;
    }
}