import { IGetAllFilter } from "../../application/interface/GetAllFiltersRepo";
import { IFilterRepository } from "../../domain/interfaces/FilterRepository";
import { FilterProps } from "../../domain/types/EntityProps";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";

@injectable()
export class GetAllFilter implements IGetAllFilter {
    constructor(
        @inject(TYPES.IFilterRepository) private _filterRepo: IFilterRepository
    ) { }

    async execute(): Promise<FilterProps[]> {
        return await this._filterRepo.getAllFilters()
    }
}