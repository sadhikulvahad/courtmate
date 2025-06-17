import cron from 'node-cron';
import { BookingRepositoryImplements } from '../dataBase/repositories/BookingRepository';
import { isBefore } from 'date-fns';
import { MongooseSlotRepository } from '../dataBase/repositories/SlotRepository';
import { BookingStatus } from '../../domain/types/EntityProps';

const bookingRepository = new BookingRepositoryImplements();
const slotRepository = new MongooseSlotRepository()

cron.schedule('0 * * * *', async () => {
  console.log("🔁 Running Booking Expiry Checker...");

  const bookings = await bookingRepository.getAllBookings();
  const slots = await slotRepository.getAllSlots()

  const now = new Date();


  if (!bookings || bookings.length === 0) {
    console.log("No bookings found");
  } else {
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
        await bookingRepository.updateBooking(booking.id.toString(), { status: 'expired' });
        console.log(`✅ Booking ${booking.id} marked as expired.`);
      }
    }
  }

  if (!slots || slots.length === 0) {
    console.log('No slots found');
  } else {
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
        // await slotRepository.update(slot);
        await slotRepository.update(slot.id, {
          ...slot.toJSON(),
          status: slot.toJSON().status as BookingStatus,
        });
        console.log(`🕒 Slot ${slot.id} marked as expired.`);
      }
    }
  }

});
