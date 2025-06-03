

import Express, {Request, Response} from 'express'
import { UserRepositoryImplement } from '../../../infrastructure/dataBase/repositories/userRepository'
import { NotificationRepositoryImplements } from '../../../infrastructure/dataBase/repositories/NotificationRepository'
import { getAllNotification } from '../../../application/useCases/getAllNotification'
import { MarkAsRead } from '../../../application/useCases/MarkasRead'
import { MarkAllAsRead } from '../../../application/useCases/MarkAllAsRead'


export class NotificaitonController {

    private readonly GetAllNotification : getAllNotification
    private readonly MarkAsReadnotification : MarkAsRead
    private readonly MarkAllAsReadNotification : MarkAllAsRead
    
    constructor () {
        const userRepository = new UserRepositoryImplement()
        const NotificationRepository = new NotificationRepositoryImplements()   
        this.GetAllNotification = new getAllNotification(NotificationRepository)
        this.MarkAsReadnotification = new MarkAsRead(NotificationRepository)
        this.MarkAllAsReadNotification = new MarkAllAsRead(NotificationRepository)
    }

    async getAdminNotifications (req: Request, res: Response) {
        try {
            const {id} = req.params
            if(!id){
                return res.status(404).json({success: false, error: "No id found"})
            }

            const result = await this.GetAllNotification.execute(id)
            if(!result.success){
                return res.status(400).json({success: false, error: result.error})
            }
            return res.status(200).json({success: true, message: result.message, notifications: result.Notifications})
        } catch (error) {
            console.log('Error from get AdminNotification controller',error)
            return res.status(500).json({success: false, error : "Server Error"})
        }
    }

    async markAsRead (req: Request, res: Response) {
        try {
            const {id} = req.body
            const result = await this.MarkAsReadnotification.execute(id)
            if(!result.success){
                return res.status(400).json({success: false, error: result.error})
            }
            res.status(200).json({success: true, message: result.message})
        } catch (error) {
            console.log('Error from Mark as read controller', error)
            return res.status(500).json({success: false, error: "Server Error"})
        }
    }

    async markAllAsRead (req: Request, res: Response) {
        try {
            const {id} = req.body
            const result = await this.MarkAllAsReadNotification.execute(id)
            if(!result.success){
                return res.status(400).json({success: false, error: result.error})
            }
            res.status(200).json({success: true, message: result.message})
        } catch (error) {
            console.log('Error from Mark as read controller', error)
            return res.status(500).json({success: false, error: "Server Error"})
        }
    }
}