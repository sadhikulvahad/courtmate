import { Request, Response } from "express";

import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/userRepository";
import { getAllUsers } from "../../../application/useCases/admin/getAllUsers";

export class UserController {
  private readonly getAllUsersUseCase: getAllUsers;

  constructor() {
    const userRepository = new UserRepositoryImplement();
    this.getAllUsersUseCase = new getAllUsers(userRepository);
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.getAllUsersUseCase.execute();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error("Error from admin user controller, get users:", error);
      res.status(500).json({ success: false, error: "Server error" });
    }
  }
}
