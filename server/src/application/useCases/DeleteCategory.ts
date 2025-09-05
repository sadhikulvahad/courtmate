import { IDeleteCategory } from "../../application/interface/DeleteCategory";
import { IFilterRepository } from "../../domain/interfaces/FilterRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";


@injectable()
export class DeleteCategory implements IDeleteCategory {
    constructor(
        @inject(TYPES.IFilterRepository) private _filterRepo : IFilterRepository
    ) { }

    async execute(id: string, category: string): Promise<void> {
        await this._filterRepo.deleteCategory(id, category);
    }
}