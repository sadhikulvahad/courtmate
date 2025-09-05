

import { GetAllUserAdvocatesDTO } from "../../../application/dto";


export interface IGetAllUserAdvocates {
    execute(): Promise<GetAllUserAdvocatesDTO>
}