import { GetAdvocateDetailsDTO } from "../../../application/dto";
import { UpdateAdvocateProfileDTO } from "../../../application/types/UpdateAdvocateProfileDTO ";


export interface IUpdateAdvocate {
    execute (data : UpdateAdvocateProfileDTO) : Promise<GetAdvocateDetailsDTO>
}