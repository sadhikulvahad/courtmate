import { inject, injectable } from "inversify";
import { ITokenService } from "../../../domain/interfaces/TokenRepository";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { ILoginUser } from "../../interface/auth/LoginUsersRepo";
import { LoginUserDTO } from "../../dto";


@injectable()
export class LoginUser implements ILoginUser {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.HashPasswordService) private _hashPassword: HashPassword,
        @inject(TYPES.ITokenRepository) private _tokenService: ITokenService,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async execute(email: string, password: string): Promise<LoginUserDTO> {
        try {

            const user = await this._userRepository.findByEmail(email);
            if (!user) {
                return { error: "Invalid Email ID" };
            }

            if (user.authMethod === 'google') {
                return { error: "This account uses Google authentication" };
            }

            if (!user.isActive || !user.isVerified) {
                return { error: "Your acount is not active please signup" }
            }

            if (user.isBlocked) {
                return { error: "Your account has blocked by the admin" }
            }

            const validPassword = await this._hashPassword.compare(password, user.password);
            if (!validPassword) {
                return { error: "Incorrect password" };
            }

            const accessToken = await this._tokenService.generateToken(user.id, user.role, user.name);
            const refreshToken = await this._tokenService.generateRefreshToken(user.id)
            return {
                user,
                token: accessToken,
                refreshToken
            };
        } catch (error) {
            this._logger.error("Login error:", { error })
            return { error: "Login failed. Please try again later." };
        }
    }
}