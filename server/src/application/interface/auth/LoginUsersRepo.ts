import { LoginUserDTO } from "../../../application/dto";



export interface ILoginUser {
    execute(email: string, password : string) : Promise<LoginUserDTO>
}