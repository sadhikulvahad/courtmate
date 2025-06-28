import { UserRepository } from "../../../domain/interfaces/userRepository";


export class GetSavedAdvocates {
    constructor(private userRepository: UserRepository) {}

    async execute(userId: string) {
        if (!userId) return { success: false, error: "User ID is required" };

        const savedAdvocates = await this.userRepository.getSavedAdvocates(userId);

        return {
            success: true,
            data: savedAdvocates,
        };
    }
}