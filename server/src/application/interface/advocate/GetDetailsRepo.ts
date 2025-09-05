import { GetAdvocateDetailsDTO } from "../../../application/dto";


export interface IGetAdvocateDetails {
    execute(id: string) : Promise <GetAdvocateDetailsDTO>
}