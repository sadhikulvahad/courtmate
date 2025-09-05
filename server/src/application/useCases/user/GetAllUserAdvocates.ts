import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { IGetAllUserAdvocates } from "../../../application/interface/user/GetAllUserAdvocatesRepo";
import { GetAllUserAdvocatesDTO } from "../../../application/dto";


@injectable()
export class GetAllUserAdvocates implements IGetAllUserAdvocates {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute() : Promise<GetAllUserAdvocatesDTO> {
        const advocates = await this._userRepository.findAdvocates()

        if (!advocates) {
            return { success: false, error: 'No Advocates' }
        }
        return { success: true, message: 'Advocates Fetched successfully', advocates }
    }
}