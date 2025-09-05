import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash"
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { IEmailService } from "../../../domain/interfaces/EmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { ISignupUser } from "../../../application/interface/auth/SignupUserRepo";
import { SignupResponse } from "../../../application/dto";


@injectable()
export class SignupUser implements ISignupUser {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.HashPasswordService) private _hashPassword: HashPassword,
        @inject(TYPES.IEmailService) private _emailService: IEmailService,
        @inject(TYPES.JwtTokenService) private _jwtService: JwtTokenService,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async execute(userInput: {
        name: string;
        email: string;
        phone: string;
        password: string;
        role: "user" | "admin" | "advocate";
    }): Promise<SignupResponse> {
        const existingUser = await this._userRepository.findByEmail(userInput.email)
        const existingNumber = await this._userRepository.findByNumber(userInput.phone)

        console.log(existingUser)

        if (existingUser && existingNumber) {
            if (!existingUser?.isActive && !existingNumber?.isActive) {
                const token = await this._jwtService.generateEmailVerificationToken(userInput.email)
                await this._emailService.sendVerificationEmail(userInput.email, token)
                return { error: "Pending activation", success: false }
            }
        } else if (existingNumber) {
            return { success: false, error: 'Phone number is already exist' }
        } else if (existingUser) {
            return { success: false, error: "User already exists" as const }
        }

        const hashedPassword = await this._hashPassword.hash(userInput.password)

        const user = new User({
            ...userInput,
            password: hashedPassword,
            isActive: false,
            isBlocked: false,
            _id: undefined,
            isVerified: false,
            authMethod: 'local',
            isAdminVerified: 'Request'
        });

        try {
            const savedUser = await this._userRepository.save(user);
            return { success: true, message: "" }
        } catch (error) {
            this._logger.error('Failed to create user from signup user from useCase', { error })
            return { error: 'Failed to create user', success: false }
        }
    }
}