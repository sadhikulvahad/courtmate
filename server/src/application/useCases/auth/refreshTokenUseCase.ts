// application/useCases/auth/refreshTokenUseCase.ts
import { inject, injectable } from "inversify";
import { ITokenService } from "../../../domain/interfaces/TokenRepository";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { IRefreshTokenUsecase } from "../../../application/interface/auth/RefreshtokenUsecaseRepo";
import { ReturnDTO } from "../../../application/dto";


@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUsecase {
  constructor(
    @inject(TYPES.ITokenRepository) private _tokenService: ITokenService,
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository
  ) { }

  async execute(refreshToken: string) : Promise<ReturnDTO> {
    try {
      const decoded = await this._tokenService.verifyRefreshToken(refreshToken);
      const user = await this._userRepository.findById(decoded.userId)
      if (!user) throw new Error("User not found");
      const newAccessToken = await this._tokenService.generateToken(decoded.userId, user.role, user.email);
      const newRefreshToken = await this._tokenService.generateRefreshToken(user.id);

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