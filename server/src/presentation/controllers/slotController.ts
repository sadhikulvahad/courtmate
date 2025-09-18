import { Request, Response } from 'express';
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';
import { zonedTimeToUtc } from 'date-fns-tz';
import { IGetSlots } from '../../application/interface/slots/GetSlotRepo';
import { IAddSlot } from '../../application/interface/slots/AddSlotRepo';
import { IPostponeSlot } from '../../application/interface/slots/PostponeSlotRepo';


@injectable()
export class SlotController {
  constructor(
    @inject(TYPES.IGetSlots) private _getSlots: IGetSlots,
    @inject(TYPES.IAddSlot) private _addSlot: IAddSlot,
    @inject(TYPES.IPostponeSlot) private _postponeSlotUseCase: IPostponeSlot,
    @inject(TYPES.Logger) private _logger: Logger
  ) { }

  async getSlots(req: Request, res: Response) {
    try {
      const { advocateId, month } = req.query;

      if (!advocateId || !month) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'advocateId and month are required' });
      }
      const slots = await this._getSlots.execute(advocateId as string, new Date(month as string));
      res.json(slots.map((slot) => slot.toJSON()));
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async addSlot(req: Request, res: Response) {
    try {
      const { advocateId, date, time } = req.body;

      if (!advocateId || !date || !time) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'advocateId, date, and time are required' });
      }
      const slot = await this._addSlot.execute({
        advocateId,
        date: new Date(date),
        time: zonedTimeToUtc(`${date} ${time}`, 'Asia/Kolkata'),
        isAvailable: true,
        status: 'confirmed',
      });
      res.status(HttpStatus.CREATED).json(slot.toJSON());
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  async postponeSlot(req: Request, res: Response) {
    try {
      const { id } = req.query;
      const { date, time, reason } = req.body;
      console.log(req.body)
      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Id required' });
      }

      if (!date || !time || !reason) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Required data missing' });
      }

      const user = req.user as { id: string; role: string; name: string } | undefined;

      if (!user?.id) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      }
      if (!date || !time) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Date and time are required' });
      }

      const slot = await this._postponeSlotUseCase.execute(id.toString(), user.id, {
        date,
        time,
        reason,
      });

      res.status(HttpStatus.OK).json(slot.toJSON());
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }
}