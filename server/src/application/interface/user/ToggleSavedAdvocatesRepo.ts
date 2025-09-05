
import { ToggleSavedAdvocateDTO } from "../../../application/dto";


export interface IToggleSavedAdvocate {
    execute(userId: string, advocateId: string): Promise<ToggleSavedAdvocateDTO>
}