import { JwtPayload } from "jsonwebtoken";
import { NotificationRepository } from "../../domain/interfaces/NotificationRepository";
import { UserRepository } from "../../domain/interfaces/UserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


@injectable()
export class getAllNotification {
    constructor(
        @inject(TYPES.NotificationRepository) private NotificationRepository: NotificationRepository,
        @inject(TYPES.Logger) private logger : Logger
    ) { }

    async execute(id: string) {
        try {
            const Notifications = await this.NotificationRepository.findByRecieverId(id)
            if (!Notifications) {
                return { success: false, error: "No Notification found" }
            }

            return { success: true, message: "Notification found succesfully", Notifications: Notifications }
        } catch (error) {
            this.logger.error("Error from Get All Admin Notification", {error})
            return { success: false, error: error }
        }
    }
}