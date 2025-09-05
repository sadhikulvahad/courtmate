

import { ReturnDTO } from "../../../application/dto";


export interface IToggleUser {
    execute(id: string, advocateId: string): Promise<ReturnDTO>
}