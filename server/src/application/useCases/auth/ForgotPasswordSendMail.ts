import { inject, injectable } from "inversify";
import { IEmailService } from "../../../domain/interfaces/EmailService";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { TYPES } from "../../../types";
import { IForgotPasswordSendMail } from "../../interface/auth/ForgotPasswordSendMailRepo";
import { ReturnDTO } from "../../dto";


@injectable()
export class forgotPasswordSendMail implements IForgotPasswordSendMail {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.IEmailService) private _emailService: IEmailService,
        @inject(TYPES.JwtTokenService) private _tokenService: JwtTokenService
    ) { }
    async execute(email: string): Promise<ReturnDTO> {
        const existingUser = await this._userRepository.findByEmail(email)
        if (!existingUser) {
            return { success: false, error: 'Invalid Email, May be you dont have an account' }
        }

        if (!existingUser.isActive) {
            return { success: false, error: 'Your account is inactive' }
        }

        if (!existingUser.isVerified) {
            return { success: false, error: 'Your account is not verified, Please Signup again' }
        }

        if (existingUser.authMethod === 'google') {
            return { success: false, error: 'You logged with Google' }
        }

        if (existingUser.isBlocked) {
            return { success: false, error: 'Your account has been blocked' }
        }

        const token = this._tokenService.generateEmailVerificationToken(email)
        await this._emailService.sendPasswordResetEmail(email, token)
        return {
            success: true,
            message: "Verification Mail send successfully"
        }
    }
}