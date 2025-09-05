
import { UserProps } from "../../../domain/types/EntityProps";


export interface ITopRatedAdvocatesUsecase {
    execute(): Promise<UserProps[]>
}