// application/useCases/auth/refreshTokenUseCase.ts
import { TokenService } from "../../../domain/interfaces/TokenRepository";
import { UserRepository } from "../../../domain/interfaces/userRepository";

export class RefreshTokenUseCase {
  constructor(
    private tokenService: TokenService,
    private userRepository : UserRepository
  ) {}

  async execute(refreshToken: string) {
    try {
      const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(decoded.userId)
      if (!user) throw new Error("User not found");
      const newAccessToken = await this.tokenService.generateToken(decoded.userId, user.role, user.email);
      const newRefreshToken = await this.tokenService.generateRefreshToken(user.id);

      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      return { success: false, error: "Invalid or expired refresh token" };
    }
  }
}