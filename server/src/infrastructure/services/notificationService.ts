import { Notification } from "../../domain/entities/Notificaiton";
import { NotificationRepository } from "../../domain/interfaces/NotificationRepository";
import { NotificationProps } from "../../domain/types/EntityProps";
import { Server as SocketIoServer } from "socket.io"

export class NotificationService {
    constructor(
        private notificationRepository: NotificationRepository,
        private io: SocketIoServer
    ) { }

    async sendNotification(props: Omit<NotificationProps, "_id">): Promise<Notification> {
        const notification = new Notification(props)
        const savedNotification = await this.notificationRepository.save(notification);

        this.io.to(props.recieverId.toString()).emit("notification", {
            message: props.message,
            type: props.type,
            read: props.read,
            createdAt: props.createdAt,
        });
        return savedNotification;
    }
}