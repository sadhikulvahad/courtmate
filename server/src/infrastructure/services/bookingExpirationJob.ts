import cron from 'node-cron';
import { BookingRepositoryImplements } from '../dataBase/repositories/BookingRepository';
import { isBefore } from 'date-fns';

const bookingRepository = new BookingRepositoryImplements();

cron.schedule('*/15 * * * *', async () => {
  console.log("🔁 Running Booking Expiry Checker...");

  const bookings = await bookingRepository.getAllBookings();

  if (!bookings || bookings.length === 0) {
    console.log("No bookings found");
    return;
  }

  const now = new Date();

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
});
