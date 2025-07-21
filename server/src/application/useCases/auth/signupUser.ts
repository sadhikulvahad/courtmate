import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash"
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { EmailService } from "../../../domain/interfaces/EmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";

type SignupResponse =
    | { success: true; message: string }
    | { success: false; error: string };


@injectable()
export class SignupUser {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.HashPasswordService) private hashPassword: HashPassword,
        @inject(TYPES.EmailService) private emailService: EmailService,
        @inject(TYPES.JwtTokenService) private jwtService: JwtTokenService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async execute(userInput: {
        name: string;
        email: string;
        phone: string;
        password: string;
        role: "user" | "admin" | "advocate";
    }): Promise<SignupResponse> {
        const existingUser = await this.userRepository.findByEmail(userInput.email)
        const existingNumber = await this.userRepository.findByNumber(userInput.phone)

        console.log(existingUser)

        if (existingUser && existingNumber) {
            if (!existingUser?.isActive && !existingNumber?.isActive) {
                const token = await this.jwtService.generateEmailVerificationToken(userInput.email)
                await this.emailService.sendVerificationEmail(userInput.email, token)
                return { error: "Pending activation", success: false }
            }
        } else if (existingNumber) {
            return { success: false, error: 'Phone number is already exist' }
        } else if (existingUser) {
            return { success: false, error: "User already exists" as const }
        }

        const hashedPassword = await this.hashPassword.hash(userInput.password)

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
            const savedUser = await this.userRepository.save(user);
            return { success: true, message: "" }
        } catch (error) {
            this.logger.error('Failed to create user from signup user from useCase', { error })
            return { error: 'Failed to create user', success: false }
        }
    }
}