import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { TYPES } from "../../../types";

interface JwtPayloadWithEmail extends JwtPayload {
    email: string;
}


@injectable()
export class VerifyForgotPasswordMail {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.JwtTokenService) private tokenService: JwtTokenService
    ) { }

    async execute(token: string) {
        if (!token) {
            return { success: false, error: "No token available" }
        }

        const isvalidToken = await this.tokenService.verifyToken(token)

        if (!isvalidToken) {
            return { success: false, error: "Invalid token" }
        }

        const decoded = jwtDecode<JwtPayloadWithEmail>(token)

        if (!decoded.email) {
            return { success: false, error: "No email availble" }
        }

        const existingUser = await this.userRepository.findByEmail(decoded.email)

        if (!existingUser) {
            return { success: false, error: "No user found with this email" }
        }

        return { success: true, message: "Email verified successfully" }

    }
}