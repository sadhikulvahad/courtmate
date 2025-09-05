import { ReturnDTO } from "../../../application/dto";


export interface IRefreshTokenUsecase {
    execute(refreshToken: string): Promise<ReturnDTO>
}