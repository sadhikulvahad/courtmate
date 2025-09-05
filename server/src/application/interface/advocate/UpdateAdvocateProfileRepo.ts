import { ReturnDTO } from "../../../application/dto";
import { UpdateAdvocateProfileDTO } from "../../../application/types/UpdateAdvocateProfileDTO ";



export interface IUpdateAdvocateProfile {
    execute(data: UpdateAdvocateProfileDTO): Promise<ReturnDTO>
}