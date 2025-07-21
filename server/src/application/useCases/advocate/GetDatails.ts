import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { S3Service } from "../../../infrastructure/web/s3Credential";

@injectable()
export class GetAdvocateDetails {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.S3Service) private s3Service: S3Service
    ) { }

    async execute(id: string) {
        try {
            if (!id) {
                return { success: false, error: "No Id Provided" }
            }
            const user = await this.userRepository.findById(id)
            if (!user) {
                return { success: false, error: "No User with this id" }
            }

            if (user?.profilePhoto) {
                const signedUrl = await this.s3Service.generateSignedUrl(user.profilePhoto);
                const bciSignedurl = await this.s3Service.generateSignedUrl(user.bciCertificate);
                user.updateProfilePhoto(signedUrl)
                user.updateBciCirtificate(bciSignedurl);
            }
            return { success: true, message: "User detail got successfully", user: user }
        } catch (error) {
            this.logger.error('Error from GetAdvocateDetails usecase', { error })
            return { success: false, error: "" }
        }
    }
}