// src/presentation/controllers/BookingController.ts
import { Request, Response } from "express";
import { GetBookSlot } from "../../application/useCases/Booking/GetBookSlot";
import { VerifyRoom } from "../../application/useCases/Booking/VerifyRoom";
import { Postpone } from "../../application/useCases/Booking/Postpone";
import { GetBookingThisHourUseCase } from "../../application/useCases/Booking/GetBook";
import { GetCallHistoryUseCase } from "../../application/useCases/Booking/GetCallHistoryUseCase";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";


@injectable()
export class BookingController {
  constructor(
    @inject(TYPES.GetBookSlot) private getBookings: GetBookSlot,
    @inject(TYPES.VerifyRoom) private VerifyRoom: VerifyRoom,
    @inject(TYPES.Postpone) private Postpone: Postpone,
    @inject(TYPES.GetBookingThisHourUseCase) private GetBook: GetBookingThisHourUseCase,
    @inject(TYPES.GetCallHistoryUseCase) private getCallHistoryUseCase: GetCallHistoryUseCase,
    @inject(TYPES.Logger) private logger: Logger
  ) { }

  async getBookSlot(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "userId is required" });
      }

      const user = req.user as { id: string; role: string } | undefined;

      if (!user || (user.id !== userId && user.role !== "admin")) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: "Unauthorized: Can only fetch own bookings" });
      }

      const bookings = await this.getBookings.execute(userId);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Bookings fetched successfully",
        bookings,
      });
    } catch (error: any) {
      this.logger.error("Error fetching bookings:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }

  async postPoneBookedSlot(req: Request, res: Response) {
    const { date, time, reason, bookId } = req.body;

    if (!date || !time || !reason || !bookId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ status: false, error: "All fields are required" });
    }

    try {
      const result = await this.Postpone.execute(date, time, reason, bookId);
      return res
        .status(HttpStatus.OK)
        .json({ status: true, message: "Postponed successfully", booking: result });
    } catch (error: any) {
      this.logger.error("Postpone Error:", { error })
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: false, error: error.message || "Something went wrong" });
    }
  }


  async verifyRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Room Id required' });
      }

      const user = req.user as { id: string; role: string; name: string } | undefined;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ isAuthorized: false, message: "Unauthorized: No user session" });
      }

      const { isAuthorized, message } = await this.VerifyRoom.execute(user.id, roomId);

      return res.status(isAuthorized ? HttpStatus.OK : HttpStatus.FORBIDDEN).json({ isAuthorized, message });
    } catch (error: any) {
      this.logger.error("Error verifying room:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ isAuthorized: false, message: "Server error" });
    }
  }

  async getBook(req: Request, res: Response) {
    try {
      const { advocateId, userId } = req.query;

      if (!advocateId || !userId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: 'Missing advocateId or userId' });
      }

      const result = await this.GetBook.execute(advocateId as string, userId as string);

      if (!result) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: 'There is no Booking at this time' });
      }
      res.status(HttpStatus.OK).json({ status: true, message: "Booking Found", booking: result });
    } catch (error) {
      this.logger.error("Error getBook:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: false, message: "Server error" });
    }
  }

  async callHistory(req: Request, res: Response) {
    try {
      const user = req.user as { id: string; role: string; name: string } | undefined;

      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: "User not authenticated" });
      }
      const result = await this.getCallHistoryUseCase.execute(user.id, user.role);

      return res.status(HttpStatus.OK).json({ status: true, data: result });
    } catch (error) {
      this.logger.error("Error callHistory:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: false, message: "Server error" });
    }

  }
}