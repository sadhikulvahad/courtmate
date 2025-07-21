import { inject, injectable } from "inversify";
import { NotificationRepository } from "../../domain/interfaces/NotificationRepository";
import { TYPES } from "../../types";


@injectable()
export class MarkAsRead {

    constructor(
        @inject(TYPES.NotificationRepository) private notificationRepository: NotificationRepository
    ) { }

    async execute(id: string) {
        if (!id) {
            return { success: false, error: "No id found" }
        }

        await this.notificationRepository.update(id, {
            read: true,
        })

        return { success: true, message: "Marked As Read" }
    }
}