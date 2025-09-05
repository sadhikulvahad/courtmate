

import { ReturnDTO } from "../../application/dto";


export interface IMarkAsRead {
    execute(id: string): Promise<ReturnDTO>
}