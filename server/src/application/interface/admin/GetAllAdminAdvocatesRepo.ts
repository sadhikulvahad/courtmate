import { AllAdminAdvocatesDTO } from "../../../application/dto";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";


export interface IGetAllAdminAdvocates {
    execute(filters : AdvocateFilterOptions) : Promise<AllAdminAdvocatesDTO>
}