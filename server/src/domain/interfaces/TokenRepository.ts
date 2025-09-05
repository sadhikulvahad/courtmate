import { accessTokenDecoded } from "../tokenTypes/accessTokenType";
import { refreshTokenDecoded } from "../tokenTypes/refreshTokenType";

// domain/interfaces/tokenService.ts
export interface ITokenService {
  generateToken(userId: string, role: string, name: string): string;
  generateRefreshToken(userId: string): string;
  verifyToken(token: string): accessTokenDecoded;
  verifyRefreshToken(token: string): refreshTokenDecoded;
  generateEmailVerificationToken(email: string): string
}