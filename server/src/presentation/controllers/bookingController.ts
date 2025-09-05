// src/presentation/controllers/BookingController.ts
import { Request, Response } from "express";
import { HttpStatus } from "../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { Logger } from "winston";
import { IGetBookSlot } from "../../application/interface/booking/GetBookSlotRepo";
import { IVerifyRoom } from "../../application/interface/booking/VerifyRoomRepo";
import { IPostpone } from "../../application/interface/booking/PostponeRepo";
import { IGetBookingThisHour } from "../../application/interface/booking/GetBookRepo";
import { IGetCallHistoryUsecase } from "../../application/interface/booking/GetCallHistoryUsecaseRepo";
import { ICancelBookingRepo } from "../../application/interface/booking/CancelBookingRepo";


@injectable()
export class BookingController {
  constructor(
    @inject(TYPES.IGetBookSlot) private _getBookings: IGetBookSlot,
    @inject(TYPES.IVerifyRoom) private _verifyRoom: IVerifyRoom,
    @inject(TYPES.IPostpone) private _postpone: IPostpone,
    @inject(TYPES.IGetBookingThisHourUseCase) private _getBook: IGetBookingThisHour,
    @inject(TYPES.IGetCallHistoryUseCase) private _getCallHistoryUseCase: IGetCallHistoryUsecase,
    @inject(TYPES.ICancelBookingRepo) private _cancelBookingRepo: ICancelBookingRepo,
    @inject(TYPES.Logger) private _logger: Logger
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

      const bookings = await this._getBookings.execute(userId, user.role);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Bookings fetched successfully",
        bookings: bookings.map(b => b.toJSON())
      });
    } catch (error: any) {
      this._logger.error("Error fetching bookings:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }


  async getAdvocateBookings(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "userId is required" });
      }

      const user = req.user as { id: string; role: string } | undefined;

      if (!user || (user.id !== userId && user.role !== "admin")) {
        return res.status(HttpStatus.FORBIDDEN).json({ message: "Unauthorized: Can only fetch own bookings" });
      }

      const bookings = await this._getBookings.execute(userId, user.role);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: "Bookings fetched successfully",
        bookings: bookings.map(b => b.toJSON()),
      });
    } catch (error: any) {
      this._logger.error("Error fetching bookings:", { error })
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
      const result = await this._postpone.execute(date, time, reason, bookId);
      return res
        .status(HttpStatus.OK)
        .json({ status: true, message: "Postponed successfully", booking: result });
    } catch (error: any) {
      this._logger.error("Postpone Error:", { error })
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: false, error: error.message || "Something went wrong" });
    }
  }


  async verifyRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.query;

      if (!roomId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Room Id required' });
      }

      const user = req.user as { id: string; role: string; name: string } | undefined;
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ isAuthorized: false, message: "Unauthorized: No user session" });
      }

      const { isAuthorized, message } = await this._verifyRoom.execute(user.id, roomId.toString());

      return res.status(isAuthorized ? HttpStatus.OK : HttpStatus.FORBIDDEN).json({ isAuthorized, message });
    } catch (error: any) {
      this._logger.error("Error verifying room:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ isAuthorized: false, message: "Server error" });
    }
  }

  async getBook(req: Request, res: Response) {
    try {
      const { advocateId, userId } = req.query;

      if (!advocateId || !userId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: 'Missing advocateId or userId' });
      }

      const result = await this._getBook.execute(advocateId as string, userId as string);

      if (!result) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: 'There is no Booking at this time' });
      }
      res.status(HttpStatus.OK).json({ status: true, message: "Booking Found", booking: result });
    } catch (error) {
      this._logger.error("Error getBook:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: false, message: "Server error" });
    }
  }

  async callHistory(req: Request, res: Response) {
    try {
      const user = req.user as { id: string; role: string; name: string } | undefined;

      if (!user) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: false, error: "User not authenticated" });
      }
      const result = await this._getCallHistoryUseCase.execute(user.id, user.role);

      return res.status(HttpStatus.OK).json({ status: true, data: result });
    } catch (error) {
      this._logger.error("Error callHistory:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: false, message: "Server error" });
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.query

      if (!bookingId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'BookingId is missing' })
      }
      
      const data = await this._cancelBookingRepo.execute(bookingId.toString())

      if (!data.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: data.error })
      }
      return res.status(HttpStatus.OK).json({ success: true, message: data.message })
    } catch (error) {
      this._logger.error("Error callHistory:", { error })
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: false, message: "Server error" });
    }
  }
}