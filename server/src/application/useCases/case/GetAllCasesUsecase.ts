import { inject, injectable } from "inversify";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { CaseProps } from "../../../domain/types/EntityProps";
import { TYPES } from "../../../types";
import { IGetAllCasesUsecase } from "../../../application/interface/case/GetAllCasesUsecaseRepo";


@injectable()
export class GetAllCasesUseCase implements IGetAllCasesUsecase {
    constructor(
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository
    ) { }

    async execute(userId: string): Promise<CaseProps[]> {
        return await this._caseRepository.findAll(userId);
    }
}