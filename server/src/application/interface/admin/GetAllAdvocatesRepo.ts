import { AllAdminAdvocatesDTO } from "../../../application/dto";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";


export interface IGetAllAdvocates {
    execute(filters: AdvocateFilterOptions): Promise<AllAdminAdvocatesDTO>
}