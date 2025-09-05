import { ReturnDTO } from "../../../application/dto";


export interface IResetForgotPassword {
    execute(password: string, email : string): Promise<ReturnDTO>
}