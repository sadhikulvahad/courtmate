import { Request, Response } from 'express'
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';
import { IGetAdminDashboardRepo } from '../../application/interface/admin/GetAdminDashboardRepo';


@injectable()
export class AdminDashboardController {
    constructor(
        @inject(TYPES.IGetAdminDashboard) private _getAdminDashboard: IGetAdminDashboardRepo,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async getAdminDashboardData(req: Request, res: Response) {
        try {
            const { adminId } = req.query

            if (!adminId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
            }

            const user = req.user as { id: string; role: string } | undefined;
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({ status: false, error: 'No AdminFound' })
            }
            if (user.role !== 'admin' || adminId !== user.id) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ status: false, error: 'You are not admin' })
            }
            const result = await this._getAdminDashboard.execute()
            res.status(HttpStatus.CREATED).json({ status: true, dashboardData: result })
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Server Error' });
        }
    }
}