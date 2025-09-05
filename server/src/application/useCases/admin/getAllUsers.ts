

import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { IGetAllUsers } from "../../../application/interface/admin/GetAllUsersRepo";
import { GetAllUsersDTO, UserDTO } from "../../../application/dto";
import { User } from "../../../domain/entities/User";


@injectable()
export class getAllUsers implements IGetAllUsers {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.Logger) private _logger: Logger,
    ) { }

    async execute(): Promise<GetAllUsersDTO> {
        try {
            const users = await this._userRepository.findUsers()
            if (!users) {
                return { success: false, error: "No Users" }
            }

            const mappedAdvocates: UserDTO[] = await Promise.all(
                users.map(async (user: User) => {
                    return {
                        _id: user.id!.toString(),
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        isBlocked: user.isBlocked,
                    };
                })
            );

            return { users: mappedAdvocates }
        } catch (error) {
            this._logger.error("Error from getAllUsers usecase", { error })
            return { success: false, error: error instanceof Error ? error.message : String(error) }
        }
    }
}