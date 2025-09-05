import { IDeletFilter } from "../../application/interface/DeleteFilter";
import { IFilterRepository } from "../../domain/interfaces/FilterRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";


@injectable()
export class DeleteFilter implements IDeletFilter {
    constructor(
        @inject(TYPES.IFilterRepository) private _filterRepo: IFilterRepository
    ) { }

    async execute(id: string): Promise<void> {
        await this._filterRepo.deleteFilter(id);
    }
}