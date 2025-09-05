import { IAddCategory } from "../../application/interface/AddCategoryRepo";
import { IFilterRepository } from "../../domain/interfaces/FilterRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";


@injectable()
export class AddCategory implements IAddCategory {
    constructor(
        @inject(TYPES.IFilterRepository) private _filterRepo: IFilterRepository
    ) { }

    async execute(id: string, category: string): Promise<void> {
        if (!id || !category) {
            throw new Error('Id or category missing')
        }

        const exisitng = await this._filterRepo.findCategory(id, category)

        if(exisitng){
            throw new Error('This Category is already exist')
        }
        
        await this._filterRepo.addCategory(id, category)
    }
}