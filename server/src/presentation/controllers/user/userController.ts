import { Request, Response } from 'express';
import { ToggleUser } from '../../../application/useCases/user/ToggleUserUsecase';
import { UserRepositoryImplement } from '../../../infrastructure/dataBase/repositories/userRepository';
import { HashPassword } from '../../../infrastructure/services/passwordHash';
import { ResetPassword } from '../../../application/useCases/user/ResetPasswordUseCase';

export class UserController { // PascalCase class name
    private readonly toggleUser: ToggleUser;
    private readonly resetPasswordUserCase: ResetPassword

    constructor() {
        const userRepository = new UserRepositoryImplement();
        const hashPassword = new HashPassword()
        this.toggleUser = new ToggleUser(userRepository);
        this.resetPasswordUserCase = new ResetPassword(userRepository, hashPassword)
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
}