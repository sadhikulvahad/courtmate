import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash";
import { TYPES } from "../../../types";
import { IResetForgotPassword } from "../../../application/interface/auth/ResetForgotPasswordRepo";
import { ReturnDTO } from "../../../application/dto";


@injectable()
export class ResetForgotPassword implements IResetForgotPassword {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.HashPasswordService) private _hashPassword: HashPassword
    ) { }

    async execute(password: string, email: string) :Promise<ReturnDTO> {
        const existingUser = await this._userRepository.findByEmail(email)

        if (!existingUser) {
            return { success: false, error: "Invalide email id" }
        }

        if (!existingUser.isActive || !existingUser.isVerified) {
            return { success: false, error: "Please signup using new Password" }
        }

        if (existingUser.isBlocked) {
            return { success: false, error: "Your account has been blocked, please contact admin" }
        }

        if (existingUser.authMethod !== 'local') {
            return { success: false, error: "You signed with google, please use google auth" }
        }

        const hashedPassword = await this._hashPassword.hash(password)

        await this._userRepository.update(existingUser.id, {
            password: hashedPassword
        })

        return { success: true, message: "Password changed successfully" }

    }
}