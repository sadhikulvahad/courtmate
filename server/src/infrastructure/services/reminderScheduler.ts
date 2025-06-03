// src/infrastructure/utils/reminderScheduler.ts
import cron from 'node-cron';
import { BookingModel } from '../dataBase/models/BookingModel';
import { Application } from 'express';
import { EmailService } from '../../domain/interfaces/EmailService';

export const startReminderScheduler = (app: Application) => {
  const emailService = app.get('emailService') as EmailService;

  // Run every minute to check for upcoming bookings
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
      const bookings = await BookingModel.find({
        status: 'confirmed',
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
        time: {
          $gte: new Date(reminderTime.getTime() - 60 * 1000), // Within 1 minute of the reminder time
          $lte: reminderTime,
        },
      })
        .populate('userId', 'email name')
        .populate('advocateId', 'email name');

      for (const booking of bookings) {
        const user = booking.userId as any;
        const advocate = booking.advocateId as any;
        const meetingTime = new Date(booking.time).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
        const roomUrl = `${process.env.BASE_URL}/video/${booking.roomId}`;

        // Send reminder to user
        await emailService.sendVideoCallReminder(
          user.email,
          user.name,
          advocate.name,
          meetingTime,
          roomUrl
        );

        // Send reminder to advocate
        await emailService.sendVideoCallReminder(
          advocate.email,
          advocate.name,
          user.name,
          meetingTime,
          roomUrl
        );

        console.log(`Reminder sent for booking ${booking._id}`);
      }
    } catch (error) {
      console.error('Error in reminder scheduler:', error);
    }
  });
};