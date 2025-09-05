import { FilterProps } from "../../domain/types/EntityProps";


export interface IFilterRepository {
    getAllFilters(): Promise<FilterProps[]>
    addFilter(name: string, type: string): Promise<void>
    addCategory(id: string, category: string): Promise<void>
    deleteCategory(id: string, category: string): Promise<void>
    deleteFilter(id: string): Promise<void>
    findFilter(name: string): Promise<FilterProps | null>
    findCategory(id: string, category: string): Promise<FilterProps | null>
}