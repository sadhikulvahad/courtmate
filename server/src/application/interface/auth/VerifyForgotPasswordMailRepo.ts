import { ReturnDTO } from "../../../application/dto";

export interface IVerifyForgotPasswordMail {
    execute(token: string): Promise<ReturnDTO>
}