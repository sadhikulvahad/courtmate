import { IAddFilter } from "../../application/interface/AddFiltersRepo";
import { IFilterRepository } from "../../domain/interfaces/FilterRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";



@injectable()
export class AddFilter implements IAddFilter {
    constructor(
        @inject(TYPES.IFilterRepository) private _filterRepo: IFilterRepository
    ) { }

    async execute(name: string, type: string): Promise<void> {
        if (!name || !type) {
            throw new Error('Filter name or type is missing')
        }

        const exisitng = await this._filterRepo.findFilter(name)

        if (exisitng) {
            throw new Error('This Filter Already Exist')
        }

        await this._filterRepo.addFilter(name, type)

    }
}