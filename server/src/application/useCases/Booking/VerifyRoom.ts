// src/application/useCases/Booking/VerifyRoom.ts
import { inject, injectable } from "inversify";
import { Booking } from "../../../domain/entities/Booking";
import { BookingRepository } from "../../../domain/interfaces/BookingRepository";
import { TYPES } from "../../../types";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { UserRepository } from "../../../domain/interfaces/UserRepository";


@injectable()
export class VerifyRoom {
    constructor(
        @inject(TYPES.BookingRepository) private bookingRepository: BookingRepository,
        @inject(TYPES.NotificationService) private notificationService: NotificationService,
        @inject(TYPES.UserRepository) private userRepository: UserRepository
    ) { }

    async execute(userId: string, roomId: string): Promise<{ isAuthorized: boolean; message: string }> {
        if (!userId || !roomId) {
            throw new Error("userId and roomId are required");
        }

        const booking = await this.bookingRepository.findByRoomId(roomId);
        const user = await this.userRepository.findById(userId)

        if (!booking) {
            return { isAuthorized: false, message: "Booking not found" };
        }
        const extractId = (obj: any): string => {
            if (!obj) return "";
            if (obj.toHexString && typeof obj.toHexString === "function") {
                return obj.toHexString();
            }
            if (obj._id && obj._id.toHexString && typeof obj._id.toHexString === "function") {
                return obj._id.toHexString();
            }
            if (typeof obj === "string") return obj;
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

        const now = new Date();

        const bufferBefore = 5 * 60 * 1000;
        const accessDuration = 60 * 60 * 1000;
        const startTime = new Date(bookedDateTime.getTime() - bufferBefore);
        const endTime = new Date(bookedDateTime.getTime() + accessDuration);

        if (now < startTime || now > endTime) {
            const formatOptions: Intl.DateTimeFormatOptions = {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
            };
            const startTimeStr = startTime.toLocaleString("en-US", formatOptions);
            const endTimeStr = endTime.toLocaleString("en-US", formatOptions);

            return {
                isAuthorized: false,
                message: `Access denied: The video call is only available between ${startTimeStr} and ${endTimeStr} IST`,
            };
        }

        if (booking.userId === userId) {
            await this.notificationService.sendNotification({
                senderId: booking.userId,
                recieverId: booking.advocateId,
                message: `${user?.name} Joined Video call`,
                read: false,
                type: "Alert",
                createdAt: new Date()
            })
        } else if (booking.advocateId === userId) {
            await this.notificationService.sendNotification({
                senderId: booking.advocateId,
                recieverId: booking.userId,
                message: `${user?.name} Joined Video call`,
                read: false,
                type: "Alert",
                createdAt: new Date()
            })
        }

        return { isAuthorized: true, message: "Authorized" };
    }
}