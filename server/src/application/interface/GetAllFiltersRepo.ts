import { FilterProps } from "../../domain/types/EntityProps";


export interface IGetAllFilter {
    execute():Promise<FilterProps[]>
}