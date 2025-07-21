import { jwtDecode, JwtPayload } from "jwt-decode";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";

interface JwtPayloadWithEmail extends JwtPayload {
    email: string;
}


@injectable()
export class verifyEmail {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.JwtTokenService) private tokenRepository: JwtTokenService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async execute(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            // const isUsedToken = await this.tokenRepository.isTokenUsed(token)
            // if(isUsedToken){
            //     return {success: false, error: 'Already verified'}
            // }

            const isvalidToken = await this.tokenRepository.verifyToken(token)

            console.log(isvalidToken)

            if (!isvalidToken) {
                return { success: false, error: 'Invalid token' }
            }

            const decoded = jwtDecode<JwtPayloadWithEmail>(token);
            if (!decoded.email) {
                return { success: false, error: 'Invalid Email' }
            }

            const existingUser = await this.userRepository.findByEmail(decoded.email)

            if (!existingUser) {
                return { success: false, error: 'Invalid Email Id' }
            }

            await this.userRepository.update(existingUser.id, {
                isActive: true,
                isVerified: true,
                verifiedAt: new Date()
            })

            // await this.tokenRepository.markTokenAsUsed(token)

            return { success: true, message: "Email verified successfully" }
        } catch (error) {
            this.logger.error("error from verify email usecases", { error })
            return { success: false, error: "Failed to verify. Please try again" }
        }
    }
}