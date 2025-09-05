import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IRedisService } from "../../../domain/interfaces/RedisService";
import { jwtDecode } from "jwt-decode";
import { ILogoutUsecase } from "../../../application/interface/auth/LogoutUsecaseRepo";
import { LogoutResponse } from "../../../application/dto";


@injectable()
export class LogoutUseCase implements ILogoutUsecase {
    constructor(
        @inject(TYPES.IRedisService) private _redisService: IRedisService
    ) { }

    async execute(token: string): Promise<LogoutResponse> {

        const decoded = jwtDecode<{ exp: number }>(token);

        if (!decoded) {
            throw new Error('Invalid Token')
        }

        const expiresIn = decoded.exp! - Math.floor(Date.now() / 1000);

        if (expiresIn <= 0) {
            return { success: true };
        }

        await this._redisService.blacklistToken(token, expiresIn);

        return { success: true }
    }
}
