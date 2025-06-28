import { Types } from "mongoose";
import { UserRepository } from "../../../domain/interfaces/userRepository";


export class ToggleSavedAdvocate {
    constructor(private userRepository: UserRepository) { }

    async execute(userId: string, advocateId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const advocate = await this.userRepository.findById(advocateId);
        if (!advocate || advocate.role !== "advocate") {
            return { success: false, error: "Advocate not found or invalid" };
        }

        const advocateObjectId = new Types.ObjectId(advocateId);

        const alreadySaved = user.savedAdvocates.some(
            (id) => id.toString() === advocateId
        );

        let updatedAdvocates: Types.ObjectId[];
        if (alreadySaved) {
            // Unsave advocate
            updatedAdvocates = user.savedAdvocates.filter(
                (id) => id.toString() !== advocateId
            );
        } else {
            // Save advocate
            updatedAdvocates = [...user.savedAdvocates, advocateObjectId];
        }

        const updatedUser = await this.userRepository.update(userId, {
            savedAdvocates: updatedAdvocates,
        });

        return {
            success: true,
            message: alreadySaved ? "Advocate unsaved" : "Advocate saved",
            data: updatedUser,
        };
    }
}