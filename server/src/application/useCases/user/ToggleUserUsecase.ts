import { inject, injectable } from "inversify"
import { IUserRepository } from "../../../domain/interfaces/UserRepository"
import { TYPES } from "../../../types"
import { NotificationService } from "../../../infrastructure/services/notificationService"
import { IToggleUser } from "../../../application/interface/user/ToggleUserUsecaseRepo"
import { ReturnDTO } from "../../../application/dto"


@injectable()
export class ToggleUser implements IToggleUser {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.NotificationService) private _notificationService: NotificationService
    ) { }

    async execute(id: string, advocateId: string) : Promise<ReturnDTO> {
        if (!id) {
            return { success: false, error: "No id provided" }
        }

        const user = await this._userRepository.findById(id)
        if (!user) {
            return { success: false, error: "User not found" }
        }

        const updatedStatus = !user.isBlocked

        await this._userRepository.update(id, {
            isBlocked: updatedStatus
        })

        await this._notificationService.sendNotification({
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