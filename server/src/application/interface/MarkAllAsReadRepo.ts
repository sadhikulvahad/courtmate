

import { ReturnDTO } from "../../application/dto";


export interface IMarkAllAsRead {
    execute(id: string): Promise<ReturnDTO>
}