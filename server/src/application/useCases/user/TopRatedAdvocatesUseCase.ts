import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { UserProps } from "../../../domain/types/EntityProps";

@injectable()
export class TopRatedAdvocatesUseCase {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.S3Service) private s3Service: S3Service
    ) { }

    async execute() {
        const advocates = await this.userRepository.topRatedAdvocates();

        const mappedAdvocates = await Promise.all(
            advocates.map(async (user) => {
                if (user.profilePhoto) {
                    user.updateProfilePhoto(await this.s3Service.generateSignedUrl(user.profilePhoto));
                }
                if (user.bciCertificate) {
                    user.updateBciCirtificate(await this.s3Service.generateSignedUrl(user.bciCertificate));
                }
                // ✅ Return everything from props, fully.
                return user.toJSON()
            })
        );

        return mappedAdvocates;
    }
}