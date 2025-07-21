import { Request, Response } from 'express'
import { GetAdvocateDashboard } from '../../application/useCases/advocate/GetAdvocateDashboard';
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';


@injectable()
export class AdvocateDashboardController {
    constructor(
        @inject(TYPES.GetAdvocateDashboard) private gatAdvocateDashboard: GetAdvocateDashboard,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async getAdvocateDashboardData(req: Request, res: Response) {
        try {
            const { advocateId } = req.params
            if (!advocateId) {
                return res.status(HttpStatus.NOT_FOUND).json({ status: false, error: 'No Advocate with this ID' })
            }
            const result = await this.gatAdvocateDashboard.execute(advocateId)
            res.status(HttpStatus.CREATED).json({ status: true, dashboardData: result })
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Server Error' });
        }
    }
}