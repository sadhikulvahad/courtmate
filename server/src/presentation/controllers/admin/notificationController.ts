

import { Request, Response } from 'express'
import { getAllNotification } from '../../../application/useCases/getAllNotification'
import { MarkAsRead } from '../../../application/useCases/MarkasRead'
import { MarkAllAsRead } from '../../../application/useCases/MarkAllAsRead'
import { HttpStatus } from '../../../domain/share/enums'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../types'
import { Logger } from 'winston'


@injectable()
export class NotificationController {

    constructor(
        @inject(TYPES.GetAllNotification) private readonly GetAllNotification: getAllNotification,
        @inject(TYPES.MarkAsRead) private readonly MarkAsReadnotification: MarkAsRead,
        @inject(TYPES.MarkAllAsRead) private readonly MarkAllAsReadNotification: MarkAllAsRead,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async getAdminNotifications(req: Request, res: Response) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, error: "No id found" })
            }

            const result = await this.GetAllNotification.execute(id)
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error })
            }
            return res.status(HttpStatus.OK).json({ success: true, message: result.message, notifications: result.Notifications })
        } catch (error) {
            this.logger.error('Error from get AdminNotification controller', { error })
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server Error" })
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.body

            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
            }

            const result = await this.MarkAsReadnotification.execute(id)
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error })
            }
            res.status(HttpStatus.OK).json({ success: true, message: result.message })
        } catch (error) {
            this.logger.error('Error from Mark as read controller', { error })
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server Error" })
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            const { id } = req.body

            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
            }

            const result = await this.MarkAllAsReadNotification.execute(id)
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error })
            }
            res.status(HttpStatus.OK).json({ success: true, message: result.message })
        } catch (error) {
            this.logger.error('Error from Mark as read controller', { error })
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server Error" })
        }
    }
}