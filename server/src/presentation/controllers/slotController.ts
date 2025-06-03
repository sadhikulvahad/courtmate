import { Request, Response } from 'express';
import { GetSlots } from '../../application/useCases/slots/GetSlot';
import { AddSlot } from '../../application/useCases/slots/AddSlot';

export class SlotController {
  constructor(
    private GetSlots: GetSlots,
    private AddSlot: AddSlot
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
      console.log(req.body)
      const { advocateId, date, time } = req.body;
      if (!advocateId || !date || !time) {
        return res.status(400).json({ message: 'advocateId, date, and time are required' });
      }
      const slot = await this.AddSlot.execute({
        advocateId,
        date: new Date(date),
        time: new Date(`${date}T${time}`),
        isAvailable: true,
        status : 'confirmed'
      });
      res.status(201).json(slot.toJSON());
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}