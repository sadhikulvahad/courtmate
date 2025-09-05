import { Request, Response } from 'express';
import { HttpStatus } from '../../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../types';
import { IToggleUser } from '../../../application/interface/user/ToggleUserUsecaseRepo';
import { IResetPassword } from '../../../application/interface/user/ResetPasswordUsecaseRepo';
import { IToggleSavedAdvocate } from '../../../application/interface/user/ToggleSavedAdvocatesRepo';
import { IGetSavedAdvocates } from '../../../application/interface/user/GetSavedAdvocatesRepo';


@injectable()
export class UserController {
    constructor(
        @inject(TYPES.IToggleUser) private _toggleUser: IToggleUser,
        @inject(TYPES.IResetPassword) private _resetPasswordUseCase: IResetPassword,
        @inject(TYPES.IToggleSavedAdvocate) private _toggleSavedAdvocates: IToggleSavedAdvocate,
        @inject(TYPES.IGetSavedAdvocates) private _getSavedAdvocatesUsecase: IGetSavedAdvocates
    ) { }

    async toggleUserisBlocked(req: Request, res: Response) {
        try {
            const { id } = req.body as { id: string };

            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
            }

            const user = req.user as { id: string; role: string; name: string } | undefined;

            const result = await this._toggleUser.execute(id, user?.id!);

            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
            }

            return res.status(HttpStatus.OK).json({ success: true, message: result.message });
        } catch (error) {
            console.error("Error in toggleUser controller:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server error" });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { id, oldPassword, newPassword } = req.body
            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id is not provided' })
            }

            const result = await this._resetPasswordUseCase.execute(id, oldPassword, newPassword)

            if (!result?.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result?.error })
            }
            return res.status(HttpStatus.OK).json({ success: true, message: result.message })

        } catch (error) {
            console.error("Error in reset Password controller:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server error" });
        }
    }

    async toggleSaveAdvocate(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;
            const { advocateId } = req.query

            if (!user?.id || !advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: "User ID or Advocate ID is missing" });
            }

            const result = await this._toggleSavedAdvocates.execute(user.id, advocateId.toString());

            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
            }

            return res.status(HttpStatus.OK).json({ success: true, message: result.message, updatedUser: result.data });

        } catch (error) {
            console.error("Error in toggleSaveAdvocate controller:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal Server Error" });
        }
    }

    async getSavedAdvocates(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined

            const result = await this._getSavedAdvocatesUsecase.execute(user?.id!);

            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
            }

            return res.status(HttpStatus.OK).json({ success: true, advocates: result.data });

        } catch (error) {
            console.error("Error fetching saved advocates:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server error" });
        }
    }
}