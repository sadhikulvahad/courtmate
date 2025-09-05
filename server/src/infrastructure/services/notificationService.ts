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

  async sendNotification(props: Omit<NotificationProps, '_id'>): Promise<Notification> {
    const notification = new Notification(props);
    const savedNotification = await this.INotificationRepository.save(notification);

    this.socketIOService.sendGeneralNotification(props.recieverId.toString(), props.message, {
      type: props.type,
      senderId: props.senderId,
      createdAt: props.createdAt,
      read: props.read,
    });

    return savedNotification;
  }
}