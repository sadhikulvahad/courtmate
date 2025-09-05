import { Request, Response } from "express";
import { HttpStatus } from "../../../domain/share/enums";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { IGetAllUsers } from "../../../application/interface/admin/GetAllUsersRepo";


@injectable()
export class UserController {

  constructor(
    @inject(TYPES.IGetAllUsers) private _getAllUsersUseCase: IGetAllUsers,
    @inject(TYPES.Logger) private readonly _logger: Logger
  ) { }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this._getAllUsersUseCase.execute();
      res.status(HttpStatus.OK).json({ success: true, data: users });
    } catch (error) {
      this._logger.error("Error from admin user controller, get users:", { error })
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: "Server error" });
    }
  }
}
