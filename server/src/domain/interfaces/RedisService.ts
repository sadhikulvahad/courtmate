export interface RedisService {
    blacklistToken(token: string, expiryInSeconds: number): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
}
