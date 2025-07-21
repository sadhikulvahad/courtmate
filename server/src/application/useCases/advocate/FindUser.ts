import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";


@injectable()
export class FindUser {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.S3Service) private s3Service: S3Service
    ) { }

    async execute(id: string) {
        if (!id) {
            return { success: false, error: 'Id is not provided' }
        }

        const user = await this.userRepository.findById(id)

        if (user?.profilePhoto) {
            const signedUrl = await this.s3Service.generateSignedUrl(user.profilePhoto);
            const bciSignedurl = await this.s3Service.generateSignedUrl(user.bciCertificate);
            user.updateProfilePhoto(signedUrl)
            user.updateBciCirtificate(bciSignedurl);
        }

        if (!user) {
            return { success: false, error: "User not found" }
        }
        return { success: true, message: 'User found', user: user }
    }
}