import { injectable, inject } from 'inversify';
import { Notification } from '../../domain/entities/Notificaiton';
import { INotificationRepository } from '../../domain/interfaces/NotificationRepository';
import { NotificationProps } from '../../domain/types/EntityProps';
import { SocketIOService } from '../../infrastructure/services/SocketIOService';
import { TYPES } from '../../types';

@injectable()
export class NotificationService {
  constructor(
    @inject(TYPES.INotificationRepository) private INotificationRepository: INotificationRepository,
    @inject(TYPES.SocketIOService) private socketIOService: SocketIOService
  ) { }

  async sendNotification(props: Omit<NotificationProps, ''>): Promise<Notification> {
    const notification = new Notification(props);
    const savedNotification = await this.INotificationRepository.save(notification);

    this.socketIOService.sendGeneralNotification(
      savedNotification.recieverId.toString(),
      savedNotification.message,
      {
        id: savedNotification.id,
        type: savedNotification.type,
        senderId: savedNotification.senderId,
        createdAt: savedNotification.createdAt,
        read: savedNotification.read,
      }
    );


    return savedNotification;
  }
}