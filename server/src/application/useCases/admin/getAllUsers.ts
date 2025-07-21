

import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { UserProps } from "../../../domain/types/EntityProps";
import { S3Service } from "../../../infrastructure/web/s3Credential";


@injectable()
export class getAllUsers {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.Logger) private logger: Logger,
        @inject(TYPES.S3Service) private s3Service : S3Service
    ) { }

    async execute() {
        try {
            const users = await this.userRepository.findUsers()

            if (!users) {
                return { success: false, error: "No Users" }
            }

            const mappedAdvocates = await Promise.all(
                users.map(async (user: UserProps) => {
                    if (user.profilePhoto) {
                        user.profilePhoto = await this.s3Service.generateSignedUrl(user.profilePhoto);
                    }
                    if (user.bciCertificate) {
                        user.bciCertificate = await this.s3Service.generateSignedUrl(user.bciCertificate);
                    }
                    return user;
                })
            );


            return { success: true, message: "Users details got successfully", users: mappedAdvocates }
        } catch (error) {
            this.logger.error("Error from getAllUsers usecase", { error })
            return { success: false, error: error }
        }
    }
}