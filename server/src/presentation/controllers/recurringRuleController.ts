import { Request, Response } from 'express';
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';
import { IAddRecurringRule } from '../../application/interface/recurringRule/AddRecurringRuleRepo';
import { IGetRecurringRules } from '../../application/interface/recurringRule/GetRecurringRuleRepo';


@injectable()
export class RecurringRuleController {
  constructor(
    @inject(TYPES.IAddRecurringRule) private _addRecurringRuleUseCase: IAddRecurringRule,
    @inject(TYPES.IGetRecurringRules) private _getRecurringRuleUsecase: IGetRecurringRules,
    @inject(TYPES.Logger) private _logger: Logger
  ) { }

  async getRecurringRule(req: Request, res: Response) {
    try {
      const advocateId = req.query.advocateId
      
      if (!advocateId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'advocateId required' });
      }

      const rules = await this._getRecurringRuleUsecase.execute(advocateId as string)
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
        startDate,
        endDate
      } = req.body;
      // console.log(req.body)


      // Input validation
      if (!advocateId || !description || !startDate || !endDate || !frequency || !daysOfWeek || !timeSlot) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'All required fields must be provided' });
      }

      // Authenticated user check
      const user = req.user as { id: string; role: string } | undefined;

      if (!user || user.id !== advocateId || user.role !== 'advocate') {
        return res.status(HttpStatus.FORBIDDEN).json({ message: 'Unauthorized: Only the advocate can add recurring rules' });
      }

      if (!Array.isArray(daysOfWeek) || daysOfWeek.some((day: number) => day < 0 || day > 6)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid days of week' });
      }

      const parsedExceptions = exceptions?.map((date: string) => new Date(date)) || [];

      if (parsedExceptions.some((date: Date) => isNaN(date.getTime()))) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid exception dates' });
      }

      const rule = await this._addRecurringRuleUseCase.execute({
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