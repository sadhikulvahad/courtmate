import { inject, injectable } from "inversify";
import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash";
import { TYPES } from "../../../types";


@injectable()
export class ResetPassword {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.HashPasswordService) private hashPassword: HashPassword
    ) { }

    async execute(id: string, oldPassword: string, newPassword: string) {
        if (!id) {
            return { success: false, error: "Id is not provided" }
        }

        if (!oldPassword) {
            return { success: false, error: "Please Provide your original Password" }
        }

        if (!newPassword) {
            return { success: false, error: "Please Provide new Password" }
        }
        const user = await this.userRepository.findById(id)

        if (!user) {
            return { success: false, error: "No User found" }
        }
        const existPassword = await this.hashPassword.compare(oldPassword, user.password)

        if (!existPassword) {
            return { success: false, error: "Your Current Password is incorrect" }
        }
        const hashPassword = await this.hashPassword.hash(newPassword)

        await this.userRepository.update(id, {
            password: hashPassword
        })

        return { success: true, message: "Password changed Successfully" }
    }
}