import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";


@injectable()
export class GetAllUserAdvocates {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository
    ) { }

    async execute() {
        const advocates = await this.userRepository.findAdvocates()

        if (!advocates) {
            return { success: false, error: 'No Advocates' }
        }
        return { success: true, message: 'Advocates Fetched successfully', advocates }
    }
}