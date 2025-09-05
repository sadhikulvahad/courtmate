import { GetAllUsersDTO } from "../../../application/dto";


export interface    IGetAllUsers {
    execute() : Promise<GetAllUsersDTO>
}