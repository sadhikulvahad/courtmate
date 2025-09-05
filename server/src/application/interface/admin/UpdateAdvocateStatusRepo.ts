import { UpdateAdvocateStatussDTO } from "../../../application/dto";


export interface IUpdateAdvocateStatus {
    execute (status : string, id: string, admin : any) : Promise<UpdateAdvocateStatussDTO>
}