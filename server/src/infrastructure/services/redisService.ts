import { inject, injectable } from "inversify";
import { IRedisService } from "../../domain/interfaces/RedisService";
import { redisClient } from "../../infrastructure/cache/redis";

@injectable()
export class RedisServiceImplement implements IRedisService {
    async blacklistToken(token: string, expiryInSeconds: number): Promise<void> {
        await redisClient.set(`blacklist:${token}`, "1", { EX: expiryInSeconds });
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await redisClient.get(`blacklist:${token}`);
        return result !== null;
    }
}
