

import { ReturnDTO } from "../../../application/dto";


export interface IResetPassword {
    execute(id: string, oldPassword: string, newPassword: string): Promise<ReturnDTO>
}