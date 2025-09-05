import { Types } from "mongoose";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IToggleSavedAdvocate } from "../../../application/interface/user/ToggleSavedAdvocatesRepo";
import { ToggleSavedAdvocateDTO } from "../../../application/dto";


@injectable()
export class ToggleSavedAdvocate implements IToggleSavedAdvocate {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(userId: string, advocateId: string) : Promise<ToggleSavedAdvocateDTO> {
        const user = await this._userRepository.findById(userId);
        if (!user) {
            return { success: false, error: "User not found" };
        }

        const advocate = await this._userRepository.findById(advocateId);
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

        const updatedUser = await this._userRepository.update(userId, {
            savedAdvocates: updatedAdvocates,
        });

        return {
            success: true,
            message: alreadySaved ? "Advocate unsaved" : "Advocate saved",
            data: updatedUser,
        };
    }
}