import { Types } from "mongoose";
import { NotificationRepository } from "../../../domain/interfaces/NotificationRepository";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { Status } from "../../../domain/types/status";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { EmailService } from "../../../domain/interfaces/EmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class UpdateAdvocateStatus {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.NotificationRepository) private notificationRepository: NotificationRepository,
        @inject(TYPES.EmailService) private emailService: EmailService,
        @inject(TYPES.NotificationService) private notificationService: NotificationService
    ) { }

    async execute(status: string, id: string, admin: any) {
        if (!id) {
            return { success: false, error: 'Id is not provided' }
        }
        if (!status) {
            return { success: false, error: 'Status is not defined' }
        }
        const updated = await this.userRepository.update(id, {
            isAdminVerified: status as Status
        })

        let content = ''
        if (status === 'Accepted') {
            content = "Advocate is verified successfully"
        } else if (status === 'Rejected') {
            content = "Your application is rejected, please contact the admin"
        }

        const user = await this.userRepository.findById(id)

        if (!user || !user.email) {
            return { success: false, error: "User or user email not found" };
        }

        await this.emailService.sendGenericNotification(user?.email, `Your Requst to join CortMate is ${status}`, content)

        await this.notificationService.sendNotification({
            recieverId: new Types.ObjectId(updated.id),
            senderId: new Types.ObjectId(admin.id as string),
            message: content,
            type: 'Notification',
            read: false,
            createdAt: new Date()
        })

        return { success: true, message: "Status updated successfully", advocate: updated }
    }
}