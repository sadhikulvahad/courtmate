import { Request, Response } from "express";

import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/UserRepository";
import { getAllUsers } from "../../../application/useCases/admin/GetAllUsers";
import { HttpStatus } from "../../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { UserRepository } from "../../../domain/interfaces/UserRepository";


@injectable()
export class UserController {

  constructor(
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.GetAllUsers) private getAllUsersUseCase: getAllUsers,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) { }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.getAllUsersUseCase.execute();
      res.status(HttpStatus.OK).json({ success: true, data: users });
    } catch (error) {
      this.logger.error("Error from admin user controller, get users:", { error })
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server error" });
    }
  }
}
