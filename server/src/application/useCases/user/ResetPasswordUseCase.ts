import { User } from "../../../domain/entities/User";
import { UserRepository } from "../../../domain/interfaces/userRepository";
import { HashPassword } from "../../../infrastructure/services/passwordHash";


export class ResetPassword {
    constructor(
        private userRepository: UserRepository,
        private hashPassword: HashPassword
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