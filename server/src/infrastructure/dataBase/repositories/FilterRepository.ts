import { IFilterRepository } from "../../../domain/interfaces/FilterRepository";
import { FilterProps } from "../../../domain/types/EntityProps";
import { FilterModel } from "../models/FiltersModel";



export class FilterRespository implements IFilterRepository {
    async getAllFilters(): Promise<FilterProps[]> {
        return await FilterModel.find()
    }
    async addFilter(name: string, type: string): Promise<void> {
        await FilterModel.create({
            name: name,
            type: type,
            options: []
        })
    }
    async addCategory(id: string, category: string): Promise<void> {
        console.log(id, category)
        await FilterModel.findByIdAndUpdate(id,
            {
                $push: { options: category }
            },
            { new: true }
        )
    }
    async deleteCategory(id: string, category: string): Promise<void> {
        await FilterModel.findByIdAndUpdate(
            id,
            { $pull: { options: category } },
            { new: true }
        );
    }

    async deleteFilter(id: string): Promise<void> {
        await FilterModel.findByIdAndDelete(id);
    }

    async findFilter(name: string): Promise<FilterProps | null> {
        return await FilterModel.findOne({
            type: name
        })
    }

    async findCategory(id: string, category: string): Promise<FilterProps | null> {
        const filter = await FilterModel.findOne({
            _id: id,
            options: category  // Mongo will check if category exists inside the options array
        }).lean();

        return filter
    }
}