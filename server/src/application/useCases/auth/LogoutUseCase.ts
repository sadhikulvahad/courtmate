import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { RedisService } from "../../../domain/interfaces/RedisService";
import { jwtDecode } from "jwt-decode";

interface LogoutResponse {
    success: boolean;
}


@injectable()
export class LogoutUseCase {
    constructor(
        @inject(TYPES.RedisService)
        private redisService: RedisService
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

        await this.redisService.blacklistToken(token, expiresIn);

        return { success: true }
    }
}
