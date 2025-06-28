import {Request, Response} from 'express'
import { GetAdvocateDashboard } from '../../application/useCases/advocate/GetAdvocateDashboard';

export class AdvocateDashboardController {
    constructor(
        private gatAdvocateDashboard : GetAdvocateDashboard
    ) {}

    async getAdvocateDashboardData(req:Request, res:Response) {
        try {
            const {advocateId} = req.params
            if(!advocateId){
                return res.status(404).json({status : false, error: 'No Advocate with this ID'})
            }
            const result = await this.gatAdvocateDashboard.execute(advocateId)
            res.status(201).json({status : true, dashboardData: result})
        } catch (error) {
            res.status(400).json({ success: false, error: 'Server Error' });
        }
    }
}