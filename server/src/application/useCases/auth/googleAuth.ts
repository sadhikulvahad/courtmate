

import { UserRepository } from "../../../domain/interfaces/userRepository";
import { User } from "../../../domain/entities/User";

export class GoogleAuth {
    constructor(private userRepository: UserRepository) { }

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