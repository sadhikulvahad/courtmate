import { Request, Response } from 'express';
import { ToggleUser } from '../../../application/useCases/user/ToggleUserUsecase';
import { UserRepositoryImplement } from '../../../infrastructure/dataBase/repositories/userRepository';
import { HashPassword } from '../../../infrastructure/services/passwordHash';
import { ResetPassword } from '../../../application/useCases/user/ResetPasswordUseCase';
import { ToggleSavedAdvocate } from '../../../application/useCases/user/ToggleSavedAdvovate';
import { GetSavedAdvocates } from '../../../application/useCases/user/GetSavedAdvocates';

export class UserController { // PascalCase class name
    private readonly toggleUser: ToggleUser;
    private readonly resetPasswordUserCase: ResetPassword
    private readonly ToggleSavedAdvocateUseCase: ToggleSavedAdvocate
    private readonly getSavedAdvocatesUseCase : GetSavedAdvocates

    constructor() {
        const userRepository = new UserRepositoryImplement();
        const hashPassword = new HashPassword()
        this.toggleUser = new ToggleUser(userRepository);
        this.resetPasswordUserCase = new ResetPassword(userRepository, hashPassword)
        this.ToggleSavedAdvocateUseCase = new ToggleSavedAdvocate(userRepository)
        this.getSavedAdvocatesUseCase = new GetSavedAdvocates(userRepository)
    }

    async toggleUserisBlocked(req: Request, res: Response) {
        try {
            const { id } = req.body as { id: string };
            if (!id) {
                return res.status(400).json({ success: false, error: "ID required" });
            }

            const result = await this.toggleUser.execute(id);

            if (!result.success) {
                return res.status(400).json({ success: false, error: result.error });
            }

            return res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            console.error("Error in toggleUser controller:", error);
            res.status(500).json({ success: false, error: "Server error" });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { id, oldPassword, newPassword } = req.body
            if (!id) {
                return res.status(400).json({ success: false, error: 'Id is not provided' })
            }

            const result = await this.resetPasswordUserCase.execute(id, oldPassword, newPassword)

            if (!result?.success) {
                return res.status(400).json({ success: false, error: result?.error })
            }
            return res.status(200).json({ success: true, message: result.message })

        } catch (error) {
            console.error("Error in reset Password controller:", error);
            res.status(500).json({ success: false, error: "Server error" });
        }
    }

    async toggleSaveAdvocate(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined;
            const { advocateId } = req.params;

            console.log(advocateId)

            if (!user?.id || !advocateId) {
                return res.status(400).json({ success: false, error: "User ID or Advocate ID is missing" });
            }

            const result = await this.ToggleSavedAdvocateUseCase.execute(user.id, advocateId);

            if (!result.success) {
                return res.status(400).json({ success: false, error: result.error });
            }

            return res.status(200).json({ success: true, message: result.message, updatedUser: result.data });

        } catch (error) {
            console.error("Error in toggleSaveAdvocate controller:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }

    async getSavedAdvocates(req: Request, res: Response) {
        try {
            const user = req.user as { id: string; role: string; name: string } | undefined; // assuming auth middleware adds this

            const result = await this.getSavedAdvocatesUseCase.execute(user?.id!);

            if (!result.success) {
                return res.status(400).json({ success: false, error: result.error });
            }

            return res.status(200).json({ success: true, advocates: result.data });

        } catch (error) {
            console.error("Error fetching saved advocates:", error);
            res.status(500).json({ success: false, error: "Server error" });
        }
    }
}