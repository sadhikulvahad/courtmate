

import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { User } from "../../../domain/entities/User";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { IGoogleAuth } from "../../../application/interface/auth/GoogleAuthRepo";


@injectable()
export class GoogleAuth implements IGoogleAuth {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(profile: {
        id: string;
        displayName: string;
        emails: { value: string }[];
    }): Promise<User> {
        const email = profile.emails[0].value;
        const existingUser = await this._userRepository.findByEmail(email);
        if (existingUser) {
            if (!existingUser.googleId) {
                const updatedUser = await this._userRepository.update(existingUser.id, {
                    googleId: profile.id,
                    authMethod: 'google',
                    isVerified: true,
                    isActive: true
                });

                if (!updatedUser) {
                    throw new Error("Failed to update user");
                }
                return updatedUser;
            }
            return existingUser;
        }

        // Create new Google user
        const newUser = new User({
            name: profile.displayName,
            email,
            googleId: profile.id,
            authMethod: 'google',
            isVerified: true,
            isActive: true,
            isBlocked: false,
            role: 'user',
            isAdminVerified: "Request"
        });

        return await this._userRepository.save(newUser);
    }
}