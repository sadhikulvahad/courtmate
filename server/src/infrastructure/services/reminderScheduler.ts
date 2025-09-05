

import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { IEmailService } from '../../domain/interfaces/EmailService';
import { BookingModel } from '../dataBase/models/BookingModel';
import cron from 'node-cron';
import { Logger } from 'winston';
import { NotificationService } from './notificationService';
import { IUserRepository } from '../../domain/interfaces/UserRepository';

@injectable()
export class ReminderSchedulerService {
  constructor(
    @inject(TYPES.IEmailService) private IEmailService: IEmailService,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.NotificationService) private notificationService: NotificationService,
    @inject(TYPES.IUserRepository) private IUserRepository: IUserRepository
  ) {
    this.startScheduler();
  }

  private startScheduler() {
    cron.schedule('49,50,51 * * * *', async () => {
      try {
        await this.checkReminders();
        this.logger.info('Reminder scheduler completed successfully');
      } catch (error: unknown) {
        this.logger.error('Error in reminder scheduler', { error });
      }
    });
  }

  async checkReminders() {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + 10 * 60 * 1000);
    const courtmate = await this.IUserRepository.findAdmin()
    const bookings = await BookingModel.find({
      status: 'confirmed',
      date: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      },
      time: {
        $gte: new Date(reminderTime.getTime() - 60 * 1000),
        $lte: reminderTime
      }
    })
      .populate('userId', 'email name')
      .populate('advocateId', 'email name');

    for (const booking of bookings) {
      const user = booking.userId as any;
      const advocate = booking.advocateId as any;
      const meetingTime = new Date(booking.time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      const roomUrl = `${process.env.REDIRECT_URL}/video/${booking.roomId}`;

      await this.IEmailService.sendVideoCallReminder(
        user.email,
        user.name,
        advocate.name,
        meetingTime,
        roomUrl
      );

      await this.IEmailService.sendVideoCallReminder(
        advocate.email,
        advocate.name,
        user.name,
        meetingTime,
        roomUrl
      );

      await this.notificationService.sendNotification({
        recieverId: user.id,
        senderId: courtmate?.id!,
        message: `You have meeting with ${advocate.name} At ${meetingTime}`,
        read: false,
        type: 'Reminder',
        createdAt: new Date()
      })

      await this.notificationService.sendNotification({
        recieverId: advocate.id,
        senderId: courtmate?.id!,
        message: `You have meeting with ${user.name} At ${meetingTime}`,
        read: false,
        type: 'Reminder',
        createdAt: new Date()
      })

      this.logger.info(`Sent reminders for booking ${booking._id}`);
    }
  }
}