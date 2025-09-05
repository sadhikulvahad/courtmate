import { FindUserDTO } from "../../../application/dto";


export interface IFindUser {
    execute(id: string) : Promise<FindUserDTO>
}