import { inject, injectable } from "inversify";
import { User } from "../../../domain/entities/User";
import { TokenService } from "../../../domain/interfaces/TokenRepository";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash";
import { TYPES } from "../../../types";
import { Logger } from "winston";


@injectable()
export class LoginUser {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.HashPasswordService) private hashPassword: HashPassword,
        @inject(TYPES.TokenRepository) private tokenService: TokenService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async execute(email: string, password: string): Promise<{
        user?: User
        token?: string,
        error?: string,
        refreshToken?: string
    }> {
        try {

            const user = await this.userRepository.findByEmail(email);
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

            const validPassword = await this.hashPassword.compare(password, user.password);
            if (!validPassword) {
                return { error: "Incorrect password" };
            }

            const accessToken = await this.tokenService.generateToken(user.id, user.role, user.name);
            const refreshToken = await this.tokenService.generateRefreshToken(user.id)
            return {
                user,
                token: accessToken,
                refreshToken
            };
        } catch (error) {
            this.logger.error("Login error:", { error })
            return { error: "Login failed. Please try again later." };
        }
    }
}