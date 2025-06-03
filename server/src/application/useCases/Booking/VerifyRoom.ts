// src/application/useCases/Booking/VerifyRoom.ts
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";

export class VerifyRoom {
    constructor(private bookingRepository: BookingRepository) { }

    async execute(userId: string, roomId: string): Promise<{ isAuthorized: boolean; message: string }> {
        if (!userId || !roomId) {
            throw new Error("userId and roomId are required");
        }

        const booking = await this.bookingRepository.findByRoomId(roomId);
        if (!booking) {
            return { isAuthorized: false, message: "Booking not found" };
        }

        // Check if the user is either the booked user or advocate
        const isUserAuthorized = booking.userId.toString() === userId || booking.advocateId.toString() === userId;
        if (!isUserAuthorized) {
            return { isAuthorized: false, message: "User is not authorized for this booking" };
        }

        // Combine date and time for validation
        const bookedDate = new Date(booking.date);
        const bookedTime = new Date(booking.time);
        const bookedDateTime = new Date(
            bookedDate.getFullYear(),
            bookedDate.getMonth(),
            bookedDate.getDate(),
            bookedTime.getHours(),
            bookedTime.getMinutes(),
            bookedTime.getSeconds()
        );

        // Current time in IST
        const now = new Date();
        // Convert to IST (optional, if stored in UTC)
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const nowIST = new Date(now.getTime() + istOffset);

        // Define time window (30-minute slot, 5-minute buffer before/after)
        const slotDuration = 30 * 60 * 1000; // 30 minutes
        const bufferBefore = 5 * 60 * 1000; // 5 minutes before
        const bufferAfter = 5 * 60 * 1000; // 5 minutes after
        const startTime = new Date(bookedDateTime.getTime() - bufferBefore);
        const endTime = new Date(bookedDateTime.getTime() + slotDuration + bufferAfter);

        // Format times in IST for error message
        const formatOptions: Intl.DateTimeFormatOptions = {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
        };
        const startTimeStr = startTime.toLocaleString("en-US", formatOptions);
        const endTimeStr = endTime.toLocaleString("en-US", formatOptions);

        if (nowIST < startTime || nowIST > endTime) {
            return {
                isAuthorized: false,
                message: `Access denied: The video call is only available between ${startTimeStr} and ${endTimeStr} IST`,
            };
        }

        return { isAuthorized: true, message: "Authorized" };
    }
}