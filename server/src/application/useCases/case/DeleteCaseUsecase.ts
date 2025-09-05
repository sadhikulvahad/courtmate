import { inject, injectable } from "inversify";
import { ICaseRepository } from "../../../domain/interfaces/CaseRepository";
import { TYPES } from "../../../types";
import { IDeleteCaseUsecase } from "../../../application/interface/case/DeleteCaseUsecaseRepo";


@injectable()
export class DeleteCaseUseCase implements IDeleteCaseUsecase{
    constructor(
        @inject(TYPES.ICaseRepository) private _caseRepository: ICaseRepository
    ) { }

    async execute(id: string): Promise<boolean> {
        const result = await this._caseRepository.delete(id);
        if (!result) {
            throw new Error("Case not found");
        }
        return result;
    }
}