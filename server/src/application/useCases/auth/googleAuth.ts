

import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { User } from "../../../domain/entities/User";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";


@injectable()
export class GoogleAuth {
    constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository) { }

    async execute(profile: {
        id: string;
        displayName: string;
        emails: { value: string }[];
    }): Promise<User> {
        const email = profile.emails[0].value;
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            if (!existingUser.googleId) {
                const updatedUser = await this.userRepository.update(existingUser.id, {
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

        return await this.userRepository.save(newUser);
    }
}