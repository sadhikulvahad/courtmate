import { jwtDecode, JwtPayload } from "jwt-decode";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { IVerifyEmail } from "../../../application/interface/auth/VerifyEmailRepo";
import { ReturnDTO } from "../../../application/dto";

interface JwtPayloadWithEmail extends JwtPayload {
    email: string;
}


@injectable()
export class verifyEmail implements IVerifyEmail {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.JwtTokenService) private _tokenRepository: JwtTokenService,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async execute(token: string): Promise<ReturnDTO> {
        try {

            const isvalidToken = await this._tokenRepository.verifyToken(token)

            if (!isvalidToken) {
                return { success: false, error: 'Invalid token' }
            }

            const decoded = jwtDecode<JwtPayloadWithEmail>(token);
            if (!decoded.email) {
                return { success: false, error: 'Invalid Email' }
            }

            const existingUser = await this._userRepository.findByEmail(decoded.email)

            if (!existingUser) {
                return { success: false, error: 'Invalid Email Id' }
            }

            await this._userRepository.update(existingUser.id, {
                isActive: true,
                isVerified: true,
                verifiedAt: new Date()
            })

            // await this.tokenRepository.markTokenAsUsed(token)

            return { success: true, message: "Email verified successfully" }
        } catch (error) {
            this._logger.error("error from verify email usecases", { error })
            return { success: false, error: "Failed to verify. Please try again" }
        }
    }
}