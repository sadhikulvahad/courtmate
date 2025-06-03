import { Types } from "mongoose";
import { Notification } from "../../../domain/entities/Notificaiton";
import { NotificationRepository } from "../../../domain/interfaces/NotificationRepository";
import NotificationModel from "../models/NotificationModel";
import { NotificationProps } from "../../../domain/types/EntityProps";
import { TypeOfNotification } from "../../../domain/types/status";


export class NotificationRepositoryImplements implements NotificationRepository {
    async findById(id: string): Promise<Notification | null> {
        const Notificaiton = await NotificationModel.findOne({ _id: id })
        return Notificaiton ? this.newNotification(Notificaiton) : null
    }

    async findByRecieverId(id: string): Promise<Notification[]> {
        const Notificaiton = await NotificationModel.find({ recieverId: id })
        const notification = Notificaiton.map((not) => this.newNotification(not))
        return notification
    }

    async findBySenderId(id: string): Promise<Notification[]> {
        const Notificaiton = await NotificationModel.find({ senderId: id })
        const notification = Notificaiton.map((not) => this.newNotification(not))
        return notification
    }

    async save(notification: Notification): Promise<Notification> {
        const Notification = this.toNotificationModel(notification)
        const savedNotification = await NotificationModel.create(Notification)
        return this.newNotification(savedNotification)
    }

    async update(id: string, notification: Notification): Promise<Notification> {
        const updatedNotification = await NotificationModel.findByIdAndUpdate(id, {
            $set: notification
        },
            { new: true, runValidators: true })
        if (!updatedNotification) {
            throw new Error("Notification Not found")
        }
        return this.newNotification(updatedNotification)
    }

    async findByRecieverIdAndUpdate(id: string, updates: Partial<Notification>): Promise<Notification[]> {
        await NotificationModel.updateMany({ recieverId : id, read: false }, { $set: updates });
        const updatedNotifications = await NotificationModel.find({ recieverId: id });
        return updatedNotifications.map((doc) => this.newNotification(doc));
    }


    private newNotification(mongooseNotification: NotificationProps): Notification {
        return new Notification({
            _id: mongooseNotification?._id?.toString(),
            recieverId: mongooseNotification.recieverId,
            senderId: mongooseNotification.senderId,
            message: mongooseNotification.message,
            type: mongooseNotification.type,
            read: mongooseNotification.read,
            createdAt: mongooseNotification.createdAt
        })
    }

    private toNotificationModel(notification: Notification): NotificationProps {
        return {
            recieverId: notification.recieverId,
            senderId: notification.senderId,
            message: notification.message,
            type: notification.type as TypeOfNotification,
            read: notification.read,
            createdAt: notification.createdAt
        };
    }
}