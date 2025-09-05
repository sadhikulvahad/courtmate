import { Request, Response } from 'express'
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';
import { IGetAdvocateDashboard } from '../../application/interface/advocate/GetAdvocateDashboardRepo';


@injectable()
export class AdvocateDashboardController {
    constructor(
        @inject(TYPES.IGetAdvocateDashboard) private _getAdvocateDashboard: IGetAdvocateDashboard,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async getAdvocateDashboardData(req: Request, res: Response) {
        try {
            const { advocateId } = req.query
            if (!advocateId) {
                return res.status(HttpStatus.NOT_FOUND).json({ status: false, error: 'No Advocate with this ID' })
            }
            const result = await this._getAdvocateDashboard.execute(advocateId.toString())
            res.status(HttpStatus.CREATED).json({ status: true, dashboardData: result })
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Server Error' });
        }
    }
}