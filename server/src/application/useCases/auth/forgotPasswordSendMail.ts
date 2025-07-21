import { inject, injectable } from "inversify";
import { EmailService } from "../../../domain/interfaces/EmailService";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { TYPES } from "../../../types";


@injectable()
export class forgotPasswordSendMail{
    constructor(
        @inject(TYPES.UserRepository) private userRepository : UserRepository,
        @inject(TYPES.EmailService) private emailService: EmailService,
        @inject(TYPES.JwtTokenService) private tokenService : JwtTokenService
         
    ){}
    async execute (email : string){
        const existingUser = await this.userRepository.findByEmail(email)
        if(!existingUser || !existingUser.isActive || !existingUser.isVerified){
            return {success : false, error: 'Invalid Email, May be you dont have an account'}
        }
        if(existingUser.authMethod === 'google'){
            return {success: false, error: 'You logged with Google'}
        }
        if(existingUser.isBlocked){
            return {success: false, error : 'Your account has been blocked'}
        }

        const token = this.tokenService.generateEmailVerificationToken(email)
        await this.emailService.sendPasswordResetEmail(email,token)
        return {success: true, message: "Verification Mail send successfully"}
    }
}