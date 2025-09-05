import { Request, Response } from 'express';
import { HttpStatus } from '../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Logger } from 'winston';
import { IGetWallet } from 'application/interface/Wallet/GetWalletRepo';


@injectable()
export class WalletController {
    constructor(
        @inject(TYPES.IGetWallet) private _getWaller: IGetWallet,
        @inject(TYPES.Logger) private _logger: Logger
    ) { }

    async getWallet(req: Request, res: Response) {
        try {
            const { userId } = req.query

            if (!userId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'UserId is missing' })
            }

            const wallet = await this._getWaller.execute(userId.toString())

            return res.status(HttpStatus.OK).json({ success: true, message: 'Wallet fetched successfully', wallet: wallet })
        } catch (error: any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
        }
    }
}