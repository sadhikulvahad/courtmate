

import { inject, injectable } from "inversify";
import { INotificationRepository } from "../../domain/interfaces/NotificationRepository";
import { TYPES } from "../../types";
import { IMarkAllAsRead } from "../../application/interface/MarkAllAsReadRepo";
import { ReturnDTO } from "../../application/dto";

@injectable()
export class MarkAllAsRead implements IMarkAllAsRead {

    constructor(
        @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository
    ) { }

    async execute(id: string) : Promise<ReturnDTO> {
        if (!id) {
            return { success: false, error: "No id found" }
        }
        await this._notificationRepository.findByRecieverIdAndUpdate(id, {
            read: true
        })

        return { success: true, message: "Marked All As Read" }
    }
}