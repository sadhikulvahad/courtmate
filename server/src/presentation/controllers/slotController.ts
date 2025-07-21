import { Request, Response } from 'express';
import { GetSlots } from '../../application/useCases/slots/GetSlot';
import { AddSlot } from '../../application/useCases/slots/AddSlot';
import { PostponeSlot } from '../../application/useCases/slots/PostponeSlot';
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';


@injectable()
export class SlotController {
  constructor(
    @inject(TYPES.GetSlots) private GetSlots: GetSlots,
    @inject(TYPES.AddSlot) private AddSlot: AddSlot,
    @inject(TYPES.PostponeSlot) private postponeSlotUseCase: PostponeSlot,
    @inject(TYPES.Logger) private logger: Logger
  ) { }

  async getSlots(req: Request, res: Response) {
    try {
      const { advocateId, month } = req.query;

      if (!advocateId || !month) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'advocateId and month are required' });
      }
      const slots = await this.GetSlots.execute(advocateId as string, new Date(month as string));
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
      const slot = await this.AddSlot.execute({
        advocateId,
        date: new Date(date),
        time: new Date(`${date}T${time}`),
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
      const { id } = req.params;
      const { date, time, reason } = req.body;

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

      const slot = await this.postponeSlotUseCase.execute(id, user.id, {
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