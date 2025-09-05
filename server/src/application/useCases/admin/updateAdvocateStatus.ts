import { Types } from "mongoose";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { Status } from "../../../domain/types/status";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { IEmailService } from "../../../domain/interfaces/EmailService";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IUpdateAdvocateStatus } from "../../../application/interface/admin/UpdateAdvocateStatusRepo";
import { UpdateAdvocateStatussDTO } from "../../../application/dto";


@injectable()
export class UpdateAdvocateStatus implements IUpdateAdvocateStatus {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.IEmailService) private _emailService: IEmailService,
        @inject(TYPES.NotificationService) private _notificationService: NotificationService
    ) { }

    async execute(status: string, id: string, admin: any) : Promise<UpdateAdvocateStatussDTO> {
        if (!id) {
            return { success: false, error: 'Id is not provided' }
        }
        if (!status) {
            return { success: false, error: 'Status is not defined' }
        }
        const updated = await this._userRepository.update(id, {
            isAdminVerified: status as Status
        })

        let content = ''
        if (status === 'Accepted') {
            content = "Advocate is verified successfully"
        } else if (status === 'Rejected') {
            content = "Your application is rejected, please contact the admin"
        }

        const user = await this._userRepository.findById(id)

        if (!user || !user.email) {
            return { success: false, error: "User or user email not found" };
        }

        await this._emailService.sendGenericNotification(user?.email, `Your Requst to join CortMate is ${status}`, content)

        await this._notificationService.sendNotification({
            recieverId: new Types.ObjectId(updated.id),
            senderId: new Types.ObjectId(admin.id as string),
            message: content,
            type: 'Notification',
            read: false,
            createdAt: new Date()
        })

        return { advocate: updated }
    }
}