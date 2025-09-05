
import { GetSavedAdvocateDTO, ToggleSavedAdvocateDTO } from "../../../application/dto";


export interface IGetSavedAdvocates {
    execute(userId: string): Promise<GetSavedAdvocateDTO>
}