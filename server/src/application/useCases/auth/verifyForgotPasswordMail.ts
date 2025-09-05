import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { TYPES } from "../../../types";
import { IVerifyForgotPasswordMail } from "../../../application/interface/auth/VerifyForgotPasswordMailRepo";
import { ReturnDTO } from "../../../application/dto";

interface JwtPayloadWithEmail extends JwtPayload {
    email: string;
}


@injectable()
export class VerifyForgotPasswordMail implements IVerifyForgotPasswordMail {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.JwtTokenService) private _tokenService: JwtTokenService
    ) { }

    async execute(token: string): Promise<ReturnDTO> {
        if (!token) {
            return { success: false, error: "No token available" }
        }

        const isvalidToken = await this._tokenService.verifyToken(token)

        if (!isvalidToken) {
            return { success: false, error: "Invalid token" }
        }

        const decoded = jwtDecode<JwtPayloadWithEmail>(token)

        if (!decoded.email) {
            return { success: false, error: "No email availble" }
        }

        const existingUser = await this._userRepository.findByEmail(decoded.email)

        if (!existingUser) {
            return { success: false, error: "No user found with this email" }
        }

        return { success: true, message: "Email verified successfully" }

    }
}