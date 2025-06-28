import { Request, Response } from 'express'
import { GetAdvocateDashboard } from '../../application/useCases/advocate/GetAdvocateDashboard';
import { GetAdminDashboard } from '../../application/useCases/admin/GetAdminDashboard';

export class AdminDashboardController {
    constructor(
        private gatAdvocateDashboard: GetAdminDashboard
    ) { }

    async getAdminDashboardData(req: Request, res: Response) {
        try {
            const { adminId } = req.params
            const user = req.user as { id: string; role: string } | undefined;
            if (!user) {
                return res.status(404).json({ status: false, error: 'No AdminFound' })
            }
            if (user.role !== 'admin' || adminId !== user.id) {
                return res.status(401).json({ status: false, error: 'You are not admin' })
            }
            const result = await this.gatAdvocateDashboard.execute()
            res.status(201).json({ status: true, dashboardData: result })
        } catch (error) {
            res.status(400).json({ success: false, error: 'Server Error' });
        }
    }
}