import { Request, Response } from 'express';
import { GetSlots } from '../../application/useCases/slots/GetSlot';
import { AddSlot } from '../../application/useCases/slots/AddSlot';
import { PostponeSlot } from '../../application/useCases/slots/PostponeSlot';

export class SlotController {
  constructor(
    private GetSlots: GetSlots,
    private AddSlot: AddSlot,
    private postponeSlotUseCase : PostponeSlot
  ) { }

  async getSlots(req: Request, res: Response) {
    try {
      const { advocateId, month } = req.query;
      if (!advocateId || !month) {
        return res.status(400).json({ message: 'advocateId and month are required' });
      }
      const slots = await this.GetSlots.execute(advocateId as string, new Date(month as string));
      res.json(slots.map((slot) => slot.toJSON()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async addSlot(req: Request, res: Response) {
    try {
      const { advocateId, date, time } = req.body;
      if (!advocateId || !date || !time) {
        return res.status(400).json({ message: 'advocateId, date, and time are required' });
      }
      const slot = await this.AddSlot.execute({
        advocateId,
        date: new Date(date),
        time: new Date(`${date}T${time}`),
        isAvailable: true,
        status: 'confirmed',
      });
      res.status(201).json(slot.toJSON());
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async postponeSlot(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { date, time, reason } = req.body;
      const user = req.user as { id: string; role: string; name: string } | undefined;

      if (!user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      if (!date || !time) {
        return res.status(400).json({ message: 'Date and time are required' });
      }

      const slot = await this.postponeSlotUseCase.execute(id, user.id, {
        date,
        time,
        reason,
      });

      res.status(200).json(slot.toJSON());
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}