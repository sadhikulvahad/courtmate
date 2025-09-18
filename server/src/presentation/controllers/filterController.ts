import { IAddCategory } from "../../application/interface/AddCategoryRepo";
import { IAddFilter } from "../../application/interface/AddFiltersRepo";
import { IGetAllFilter } from "../../application/interface/GetAllFiltersRepo";
import { HttpStatus } from "../../domain/share/enums";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { formToJSON } from "axios";
import { IDeleteCategory } from "../../application/interface/DeleteCategory";
import { IDeletFilter } from "../../application/interface/DeleteFilter";


@injectable()
export class FilterController {
    constructor(
        @inject(TYPES.IGetAllFilter) private _getAllFilters: IGetAllFilter,
        @inject(TYPES.IAddFilter) private _addFilter: IAddFilter,
        @inject(TYPES.IAddCategory) private _addCategory: IAddCategory,
        @inject(TYPES.IDeleteCategory) private _deleteCategory: IDeleteCategory,
        @inject(TYPES.IDeleteFilter) private _deleteFilter: IDeletFilter
    ) { }

    async getAllFilters(req: Request, res: Response) {
        try {

            const filters = await this._getAllFilters.execute()
            return res.status(HttpStatus.OK).json({ filters })
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch filters", error });
        }
    }

    async addFilter(req: Request, res: Response) {
        try {
            const { name, type } = req.body;
            if (!name || !type) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: "Filter name and type is required" });
            }
            await this._addFilter.execute(name, type);
            return res.status(HttpStatus.CREATED).json({ message: "Filter added successfully" });
        } catch (error: any) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || "Failed to add filter" });
        }
    }

    async addCategory(req: Request, res: Response) {
        try {
            const { category, id } = req.body;

            if (!id || !category) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: "Filter ID and category are required" });
            }

            await this._addCategory.execute(id, category);
            return res.status(HttpStatus.OK).json({ message: "Category added successfully" });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to add category", error });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const { filterId, category } = req.body

            if (!filterId || !category) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: "Filter ID and category are required" });
            }

            await this._deleteCategory.execute(filterId.toString(), category.toString())
            return res.status(HttpStatus.OK).json({ message: 'Category Deleted successfully' })
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete category", error });
        }
    }

    async deleteFilter(req: Request, res: Response) {
        try {
            const { filterId } = req.query
            if (!filterId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: "Filter ID required" });
            }

            await this._deleteFilter.execute(filterId.toString())
            return res.status(HttpStatus.OK).json({ message: 'Filter Deleted Successfully' })
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete filter", error });
        }
    }
}