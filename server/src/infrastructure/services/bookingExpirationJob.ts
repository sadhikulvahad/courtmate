import { injectable, inject } from 'inversify';
import { TYPES } from '../../types';
import { BookingRepository } from '../../domain/interfaces/BookingRepository';
import { SlotRepository } from '../../domain/interfaces/SlotRepository';
import { Logger } from 'winston';
import { isBefore } from 'date-fns';
import { BookingStatus } from '../../domain/types/EntityProps';
import cron from 'node-cron';

@injectable()
export class BookingExpirationJobService {
  constructor(
    @inject(TYPES.BookingRepository) private bookingRepository: BookingRepository,
    @inject(TYPES.SlotRepository) private slotRepository: SlotRepository,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    this.startCronJob();
  }

  private startCronJob() {
    cron.schedule('0 * * * *', async () => {
      try {
        await this.checkExpirations();
        this.logger.info('Booking expiration job completed successfully');
      } catch (error: unknown) {
        this.logger.error('Error in booking expiration job', { error });
      }
    });
  }

  async checkExpirations() {
    this.logger.info('Running Booking Expiry Checker...');
    const now = new Date();

    // Check bookings
    const bookings = await this.bookingRepository.getAllBookings();
    if (bookings?.length) {
      for (const booking of bookings) {
        const bookingDate = new Date(booking.date);
        const bookingTime = new Date(booking.time);
        const bookingDateTime = new Date(
          bookingDate.getFullYear(),
          bookingDate.getMonth(),
          bookingDate.getDate(),
          bookingTime.getHours(),
          bookingTime.getMinutes()
        );

        if (isBefore(bookingDateTime, now) && booking.status !== 'expired') {
          await this.bookingRepository.updateBooking(booking.id.toString(), { status: 'expired' });
          this.logger.info(`Updated booking ${booking.id} to expired`);
        }
      }
    }

    // Check slots
    const slots = await this.slotRepository.getAllSlots();
    if (slots?.length) {
      for (const slot of slots) {
        const slotDate = new Date(slot.date);
        const slotTime = new Date(slot.time);
        const slotDateTime = new Date(
          slotDate.getFullYear(),
          slotDate.getMonth(),
          slotDate.getDate(),
          slotTime.getHours(),
          slotTime.getMinutes()
        );

        if (isBefore(slotDateTime, now) && slot.status !== 'expired') {
          slot.markAsExpired();
          await this.slotRepository.update(slot.id, {
            ...slot.toJSON(),
            status: slot.toJSON().status as BookingStatus,
          });
          this.logger.info(`Updated slot ${slot.id} to expired`);
        }
      }
    }
  }
}