import { UserRepository } from "../../../domain/interfaces/userRepository"


export class ToggleUser {
    constructor(
        private userRepository: UserRepository,
    ) { }

    async execute(id: string) {
        if (!id) {
            return { success: false, error: "No id provided" }
        }

        const user = await this.userRepository.findById(id)
        if (!user) {
            return { success: false, error: "User not found" }
        }

        const updatedStatus = !user.isBlocked

        await this.userRepository.update(id, {
            isBlocked: updatedStatus
        })

        return {
            success: true,
            message: `User ${updatedStatus ? 'blocked' : 'unblocked'} successfully`
        }
    }
}