import { inject, injectable } from "inversify";
import { CaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";


@injectable()
export class GetAllCasesUseCase {
    constructor(@inject(TYPES.CaseRepository) private caseRepository: CaseRepository) { }

    async execute(userId: string): Promise<CaseProps[]> {
        return await this.caseRepository.findAll(userId);
    }
}