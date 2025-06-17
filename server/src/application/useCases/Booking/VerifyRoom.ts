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
        console.log(booking)
        if (!booking) {
            return { isAuthorized: false, message: "Booking not found" };
        }
        // Check if the user is either the booked user or advocate
        const extractId = (obj: any): string => {
            if (!obj) return "";
            // Handle ObjectId instances directly
            if (obj.toHexString && typeof obj.toHexString === "function") {
                return obj.toHexString();
            }
            // Handle nested _id objects
            if (obj._id && obj._id.toHexString && typeof obj._id.toHexString === "function") {
                return obj._id.toHexString();
            }
            // Handle string IDs
            if (typeof obj === "string") return obj;
            // Handle objects with string _id
            if (obj._id && typeof obj._id === "string") return obj._id;
            return "";
        };

        const bookingUserId = extractId(booking.userId);
        const bookingAdvocateId = extractId(booking.advocateId);

        const isUserAuthorized =
            bookingUserId === userId ||
            bookingAdvocateId === userId;

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