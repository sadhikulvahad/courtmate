import { inject, injectable } from "inversify";
import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { TYPES } from "../../../types";


@injectable()
export class DeleteCaseUseCase {
    constructor(@inject(TYPES.CaseRepository) private caseRepository: CaseRepository) { }

    async execute(id: string): Promise<boolean> {
        const result = await this.caseRepository.delete(id);
        if (!result) {
            throw new Error("Case not found");
        }
        return result;
    }
}