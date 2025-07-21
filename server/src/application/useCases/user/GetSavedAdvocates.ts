import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";


@injectable()
export class GetSavedAdvocates {
    constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository) { }

    async execute(userId: string) {
        if (!userId) return { success: false, error: "User ID is required" };

        const savedAdvocates = await this.userRepository.getSavedAdvocates(userId);

        return {
            success: true,
            data: savedAdvocates,
        };
    }
}