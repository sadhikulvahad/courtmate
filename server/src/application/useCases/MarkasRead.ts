import { inject, injectable } from "inversify";
import { INotificationRepository } from "../../domain/interfaces/NotificationRepository";
import { TYPES } from "../../types";
import { IMarkAsRead } from "../../application/interface/MarkAsReadRepo";
import { ReturnDTO } from "../../application/dto";


@injectable()
export class MarkAsRead implements IMarkAsRead {

    constructor(
        @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository
    ) { }

    async execute(id: string) : Promise<ReturnDTO> {
        if (!id) {
            return { success: false, error: "No id found" }
        }

        await this._notificationRepository.update(id, {
            read: true,
        })

        return { success: true, message: "Marked As Read" }
    }
}