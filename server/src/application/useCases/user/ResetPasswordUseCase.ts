import { inject, injectable } from "inversify";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash";
import { TYPES } from "../../../types";
import { IResetPassword } from "../../../application/interface/user/ResetPasswordUsecaseRepo";
import { ReturnDTO } from "../../../application/dto";


@injectable()
export class ResetPassword implements IResetPassword {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.HashPasswordService) private _hashPassword: HashPassword
    ) { }

    async execute(id: string, oldPassword: string, newPassword: string) : Promise<ReturnDTO> {
        if (!id) {
            return { success: false, error: "Id is not provided" }
        }

        if (!oldPassword) {
            return { success: false, error: "Please Provide your original Password" }
        }

        if (!newPassword) {
            return { success: false, error: "Please Provide new Password" }
        }
        const user = await this._userRepository.findById(id)

        if (!user) {
            return { success: false, error: "No User found" }
        }
        const existPassword = await this._hashPassword.compare(oldPassword, user.password)

        if (!existPassword) {
            return { success: false, error: "Your Current Password is incorrect" }
        }
        const hashPassword = await this._hashPassword.hash(newPassword)

        await this._userRepository.update(id, {
            password: hashPassword
        })

        return { success: true, message: "Password changed Successfully" }
    }
}