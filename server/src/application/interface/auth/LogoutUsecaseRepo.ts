import { ReturnDTO } from "../../../application/dto";

export interface ILogoutUsecase {
    execute(token: string): Promise<ReturnDTO>
}