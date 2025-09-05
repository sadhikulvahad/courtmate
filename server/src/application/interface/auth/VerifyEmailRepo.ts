import { ReturnDTO } from "../../../application/dto";


export interface IVerifyEmail {
    execute(token: string): Promise<ReturnDTO>
}