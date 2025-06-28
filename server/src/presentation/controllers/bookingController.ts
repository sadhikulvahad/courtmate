// src/presentation/controllers/BookingController.ts
import { Request, Response } from "express";
import { BookSlot } from "../../application/useCases/Booking/BookSlot";
import { GetBookSlot } from "../../application/useCases/Booking/GetBookSlot";
import { NotificationRepositoryImplements } from "../../infrastructure/dataBase/repositories/NotificationRepository";
import { NotificationService } from "../../infrastructure/services/notificationService";
import { VerifyRoom } from "../../application/useCases/Booking/VerifyRoom";
import { Postpone } from "../../application/useCases/Booking/Postpone";
import { GetBookingThisHourUseCase } from "../../application/useCases/Booking/GetBook";
import { GetCallHistoryUseCase } from "../../application/useCases/Booking/GetCallHistoryUseCase";

export class BookingController {
  constructor(
    private getBookings: GetBookSlot,
    private VerifyRoom: VerifyRoom,
    private Postpone: Postpone,
    private GetBook: GetBookingThisHourUseCase,
    private getCallHistoryUseCase: GetCallHistoryUseCase
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

  async getBook(req: Request, res: Response) {
    try {
      const { advocateId, userId } = req.query;

      if (!advocateId || !userId) {
        return res.status(400).json({ status: false, error: 'Missing advocateId or userId' });
      }

      const result = await this.GetBook.execute(advocateId as string, userId as string);

      if (!result) {
        return res.status(400).json({ status: false, error: 'There is no Booking at this time' });
      }
      res.status(200).json({ status: true, message: "Booking Found", booking: result });
    } catch (error) {
      console.error("Error getBook:", error);
      return res.status(500).json({ status: false, message: "Server error" });
    }
  }

  async callHistory(req: Request, res: Response) {
    try {
      const user = req.user as { id: string; role: string; name: string } | undefined;

      if (!user) {
        return res.status(400).json({ status: false, error: "User not authenticated" });
      }
      console.log(user.id, user.role)
      const result = await this.getCallHistoryUseCase.execute(user.id, user.role);

      return res.status(200).json({ status: true, data: result });
    } catch (error) {
      console.error("Error callHistory:", error);
      return res.status(500).json({ status: false, message: "Server error" });
    }

  }
}