import { Request, Response } from 'express';
import { ToggleUser } from '../../../application/useCases/user/ToggleUserUsecase';
import { ResetPassword } from '../../../application/useCases/user/ResetPasswordUseCase';
import { ToggleSavedAdvocate } from '../../../application/useCases/user/ToggleSavedAdvovate';
import { GetSavedAdvocates } from '../../../application/useCases/user/GetSavedAdvocates';
import { HttpStatus } from '../../../domain/share/enums';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../../types';


@injectable()
export class UserController {
    constructor(
        @inject(TYPES.ToggleUser) private toggleUser: ToggleUser,
        @inject(TYPES.ResetPassword) private resetPasswordUseCase: ResetPassword,
        @inject(TYPES.ToggleSavedAdvocate) private toggleSavedAdvocates: ToggleSavedAdvocate,
        @inject(TYPES.GetSavedAdvocates) private getSavedAdvocatesUsecase: GetSavedAdvocates
    ) { }

    async toggleUserisBlocked(req: Request, res: Response) {
        try {
            const { id } = req.body as { id: string };

            if (!id) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
            }

            const user = req.user as { id: string; role: string; name: string } | undefined;

            const result = await this.toggleUser.execute(id, user?.id!);

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

            const result = await this.resetPasswordUseCase.execute(id, oldPassword, newPassword)

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
            const { advocateId } = req.params

            if (!user?.id || !advocateId) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: "User ID or Advocate ID is missing" });
            }

            const result = await this.toggleSavedAdvocates.execute(user.id, advocateId);

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

            const result = await this.getSavedAdvocatesUsecase.execute(user?.id!);

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