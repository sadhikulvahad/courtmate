// src/presentation/controllers/BookingController.ts
import { Request, Response } from "express";
import { BookSlot } from "../../application/useCases/Booking/BookSlot";
import { GetBookSlot } from "../../application/useCases/Booking/GetBookSlot";
import { NotificationRepositoryImplements } from "../../infrastructure/dataBase/repositories/NotificationRepository";
import { NotificationService } from "../../infrastructure/services/notificationService";
import { VerifyRoom } from "../../application/useCases/Booking/VerifyRoom";
import { Postpone } from "../../application/useCases/Booking/Postpone";

export class BookingController {
  constructor(
    private BookSlot: BookSlot,
    private getBookings: GetBookSlot,
    private VerifyRoom: VerifyRoom,
    private Postpone: Postpone
  ) { }

  async getBookSlot(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const user = req.user as { id: string; role: string } | undefined;

      if (!user || (user.id !== userId && user.role !== "admin")) {
        return res.status(403).json({ message: "Unauthorized: Can only fetch own bookings" });
      }

      const bookings = await this.getBookings.execute(userId);

      return res.status(200).json({
        success: true,
        message: "Bookings fetched successfully",
        bookings,
      });
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async bookSlot(req: Request, res: Response) {
    const user = req.user as { id: string; role: string; name: string } | undefined;
    const io = req.app.get("io");
    try {
      const { advocateId, slotId, userId, notes } = req.body;
      if (!advocateId || !slotId || !userId) {
        return res.status(400).json({ message: "advocateId, slotId, and userId are required" });
      }

      const notificationRepo = new NotificationRepositoryImplements();
      const notificationService = new NotificationService(notificationRepo, io);
      const booking = await this.BookSlot.execute(advocateId, slotId, userId, notes, user, notificationService);
      res.status(201).json(booking.toJSON());
    } catch (error: any) {
      res.status(500).json({ message: "Server error" });
    }
  }

  async postPoneBookedSlot(req: Request, res: Response) {
    const { date, time, reason, bookId } = req.body;

    if (!date || !time || !reason || !bookId) {
      return res
        .status(400)
        .json({ status: false, error: "All fields are required" });
    }

    try {
      const result = await this.Postpone.execute(date, time, reason, bookId);
      return res
        .status(200)
        .json({ status: true, message: "Postponed successfully", booking: result });
    } catch (error: any) {
      console.error("Postpone Error:", error.message);

      return res
        .status(500)
        .json({ status: false, error: error.message || "Something went wrong" });
    }
  }


  async verifyRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const user = req.user as { id: string; role: string; name: string } | undefined;

      if (!user) {
        return res.status(401).json({ isAuthorized: false, message: "Unauthorized: No user session" });
      }

      const { isAuthorized, message } = await this.VerifyRoom.execute(user.id, roomId);

      return res.status(isAuthorized ? 200 : 403).json({ isAuthorized, message });
    } catch (error: any) {
      console.error("Error verifying room:", error);
      return res.status(500).json({ isAuthorized: false, message: "Server error" });
    }
  }
}