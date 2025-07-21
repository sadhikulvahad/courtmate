import { Request, Response } from 'express';
import { AddRecurringRule } from '../../application/useCases/recurringRule/AddRecurringRule';
import { GetRecurringRulesByAdvocate } from '../../application/useCases/recurringRule/GetRecurringRule';
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';


@injectable()
export class RecurringRuleController {
  constructor(
    @inject(TYPES.AddRecurringRule) private addRecurringRuleUseCase: AddRecurringRule,
    @inject(TYPES.GetRecurringRulesByAdvocate) private GetRecurringRuleUsecase: GetRecurringRulesByAdvocate,
    @inject(TYPES.Logger) private logger: Logger
  ) { }

  async getRecurringRule(req: Request, res: Response) {
    try {
      const advocateId = req.query.advocateId
      
      if (!advocateId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'advocateId required' });
      }

      const rules = await this.GetRecurringRuleUsecase.execute(advocateId as string)
      res.status(HttpStatus.OK).json({ status: true, message: 'Fetched successfully', rules });

      // return 
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error || "Server error" });
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
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'All required fields must be provided' });
      }

      // Authenticated user check
      const user = req.user as { id: string; role: string } | undefined;
      if (!user || user.id !== advocateId || user.role !== 'advocate') {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Unauthorized: Only the advocate can add recurring rules' });
      }

      // Validate time format
      if (!/^\d{2}:\d{2}$/.test(timeSlot)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid timeSlot format (expected HH:mm)' });
      }

      const [hours] = timeSlot.split(':').map(Number);
      if (hours < 9 || hours > 17) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Time slot must be between 09:00 and 17:00' });
      }

      if (!Array.isArray(daysOfWeek) || daysOfWeek.some((day: number) => day < 0 || day > 6)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid days of week' });
      }

      const parsedExceptions = exceptions?.map((date: string) => new Date(date)) || [];
      if (parsedExceptions.some((date: Date) => isNaN(date.getTime()))) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid exception dates' });
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


      res.status(HttpStatus.CREATED).json(rule);
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message || "Server error" });
    }
  }
}