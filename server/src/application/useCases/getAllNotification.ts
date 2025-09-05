
import { INotificationRepository } from "../../domain/interfaces/NotificationRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";
import { IGetAllNotification } from "../../application/interface/GetAllNotificationRepo";
import { GetNotificationsDTO } from "../../application/dto";


@injectable()
export class getAllNotification implements IGetAllNotification {
    constructor(
        @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async execute(id: string) :Promise<GetNotificationsDTO> {
        try {
            const Notifications = await this._notificationRepository.findByRecieverId(id)
            if (!Notifications) {
                return { success: false, error: "No Notification found" }
            }

            return { success: true, message: "Notification found succesfully", Notifications: Notifications }
        } catch (error) {
            this._logger.error("Error from Get All Admin Notification", { error })
            return { success: false, error: error instanceof Error ? error.message : String(error) }
        }
    }
}