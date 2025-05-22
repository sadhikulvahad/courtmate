import { UserRepository } from "../../../domain/interfaces/userRepository";
import { JwtTokenService } from "../../../infrastructure/services/jwt";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface JwtPayloadWithEmail extends JwtPayload {
    email: string;
}

export class VerifyForgotPasswordMail{
    constructor(
        private userRepository : UserRepository,
        private tokenService : JwtTokenService
    ){}

    async execute (token: string){
        if(!token){
            return {success: false, error: "No token available"}
        }

        const isvalidToken = await this.tokenService.verifyToken(token)

        if(!isvalidToken){
            return {success: false, error: "Invalid token"}
        }

        const decoded = jwtDecode<JwtPayloadWithEmail>(token)

        if(!decoded.email){
            return {success:false, error: "No email availble"}
        }

        const existingUser = await this.userRepository.findByEmail(decoded.email)

        if(!existingUser){
            return {success: false, error: "No user found with this email"}
        }

        return {success: true, message: "Email verified successfully"}

    }
}