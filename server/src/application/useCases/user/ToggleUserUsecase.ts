import { inject, injectable } from "inversify"
import { UserRepository } from "../../../domain/interfaces/UserRepository"
import { TYPES } from "../../../types"
import { NotificationService } from "../../../infrastructure/services/notificationService"


@injectable()
export class ToggleUser {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.NotificationService) private notificationService: NotificationService
    ) { }

    async execute(id: string, advocateId: string) {
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

        await this.notificationService.sendNotification({
            message: `Your Acoount is ${updatedStatus ? 'Blocked' : 'Unblocked'} by CourtMate`,
            read: false,
            recieverId: id,
            senderId: advocateId,
            type: "Notification",
            createdAt: new Date()
        })

        return {
            success: true,
            message: `User ${updatedStatus ? 'blocked' : 'unblocked'} successfully`
        }
    }
}