

import { Request, Response } from 'express'
import { HttpStatus } from '../../../domain/share/enums'
import { inject, injectable } from 'inversify'
import { TYPES } from '../../../types'
import { Logger } from 'winston'
import { IGetAllNotification } from '../../../application/interface/GetAllNotificationRepo'
import { IMarkAsRead } from '../../../application/interface/MarkAsReadRepo'
import { IMarkAllAsRead } from '../../../application/interface/MarkAllAsReadRepo'


@injectable()
export class NotificationController {

    constructor(
        @inject(TYPES.IGetAllNotification) private readonly _getAllNotification: IGetAllNotification,
        @inject(TYPES.IMarkAsRead) private readonly _markAsReadnotification: IMarkAsRead,
        @inject(TYPES.IMarkAllAsRead) private readonly _markAllAsReadNotification: IMarkAllAsRead,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async getAdminNotifications(req: Request, res: Response) {
        try {
            const { id } = req.query
            if (!id) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, error: "No id found" })
            }

            const result = await this._getAllNotification.execute(id.toString())
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error })
            }
            return res.status(HttpStatus.OK).json({ success: true, message: result.message, notifications: result.Notifications })
        } catch (error) {
            this._logger.error('Error from get AdminNotification controller', { error })
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server Error" })
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.body

            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
            }

            const result = await this._markAsReadnotification.execute(id)
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error })
            }
            res.status(HttpStatus.OK).json({ success: true, message: result.message })
        } catch (error) {
            this._logger.error('Error from Mark as read controller', { error })
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server Error" })
        }
    }

    async markAllAsRead(req: Request, res: Response) {
        try {
            const { id } = req.body

            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
            }

            const result = await this._markAllAsReadNotification.execute(id)
            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error })
            }
            res.status(HttpStatus.OK).json({ success: true, message: result.message })
        } catch (error) {
            this._logger.error('Error from Mark as read controller', { error })
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server Error" })
        }
    }
}