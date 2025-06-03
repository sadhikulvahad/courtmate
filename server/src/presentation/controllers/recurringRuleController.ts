import { Request, Response } from 'express';
import { AddRecurringRule } from '../../application/useCases/recurringRule/AddRecurringRule';
import { isBefore, isValid, startOfDay } from 'date-fns';
import { GetRecurringRulesByAdvocate } from '../../application/useCases/recurringRule/GetRecurringRule';

export class RecurringRuleController {
  constructor(
    private addRecurringRuleUseCase: AddRecurringRule,
    private GetRecurringRuleUsecase: GetRecurringRulesByAdvocate
  ) { }

  async getRecurringRule(req: Request, res: Response) {
    try {
      const advocateId = req.query.advocateId

      const rules = await this.GetRecurringRuleUsecase.execute(advocateId as string)
      res.status(200).json({ status: true, message: 'Fetched successfully', rules });

      // return 
    } catch (error) {
      return res.status(400).json({ message: error || "Server error" });
    }
  }

  async addRecurringRule(req: Request, res: Response) {
    try {
      const {
        advocateId,
        description,
        frequency,
        daysOfWeek,
        timeSlot,
        exceptions,
      } = req.body;

      const startDate = new Date(req.body.startDate).toISOString();
      const endDate = new Date(req.body.endDate).toISOString();

      // Input validation
      if (!advocateId || !description || !startDate || !endDate || !frequency || !daysOfWeek || !timeSlot) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      // Authenticated user check
      const user = req.user as { id: string; role: string } | undefined;
      if (!user || user.id !== advocateId || user.role !== 'advocate') {
        return res.status(403).json({ message: 'Unauthorized: Only the advocate can add recurring rules' });
      }

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
        return res.status(400).json({ message: 'Invalid timeSlot format (expected HH:mm)' });
      }

      const [hours] = timeSlot.split(':').map(Number);
      if (hours < 9 || hours > 17) {
        return res.status(400).json({ message: 'Time slot must be between 09:00 and 17:00' });
      }

      if (!Array.isArray(daysOfWeek) || daysOfWeek.some((day: number) => day < 0 || day > 6)) {
        return res.status(400).json({ message: 'Invalid days of week' });
      }

      const parsedExceptions = exceptions?.map((date: string) => new Date(date)) || [];
      if (parsedExceptions.some((date: Date) => isNaN(date.getTime()))) {
        return res.status(400).json({ message: 'Invalid exception dates' });
      }

      const rule = await this.addRecurringRuleUseCase.execute({
        advocateId,
        description,
        startDate,
        endDate,
        frequency,
        daysOfWeek,
        timeSlot,
        exceptions: parsedExceptions,
      });


      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Server error" });
    }
  }
}