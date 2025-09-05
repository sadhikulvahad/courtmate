import { ReturnDTO } from "../../../application/dto";


export interface IForgotPasswordSendMail {
    execute (email: string) : Promise<ReturnDTO>
}