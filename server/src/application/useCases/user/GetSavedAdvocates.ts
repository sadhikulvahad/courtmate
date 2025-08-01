import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";


@injectable()
export class GetSavedAdvocates {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.S3Service) private s3Service: S3Service
    ) { }

    async execute(userId: string) {
        if (!userId) return { success: false, error: "User ID is required" };

        const savedAdvocates = await this.userRepository.getSavedAdvocates(userId);

        const mappedAdvocates = await Promise.all(
            savedAdvocates.map(async (user) => {
                if (user.profilePhoto) {
                    user.updateProfilePhoto(await this.s3Service.generateSignedUrl(user.profilePhoto));
                }
                if (user.bciCertificate) {
                    user.updateBciCirtificate(await this.s3Service.generateSignedUrl(user.bciCertificate));
                }

                return user.toJSON()
            })
        );

        return {
            success: true,
            data: mappedAdvocates,
        };
    }
}