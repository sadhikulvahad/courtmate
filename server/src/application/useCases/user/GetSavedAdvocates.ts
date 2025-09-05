import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { IGetSavedAdvocates } from "../../../application/interface/user/GetSavedAdvocatesRepo";
import { GetSavedAdvocateDTO } from "../../../application/dto";


@injectable()
export class GetSavedAdvocates implements IGetSavedAdvocates {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.S3Service) private _s3Service: S3Service
    ) { }

    async execute(userId: string) : Promise<GetSavedAdvocateDTO> {
        if (!userId) return { success: false, error: "User ID is required" };

        const savedAdvocates = await this._userRepository.getSavedAdvocates(userId);

        const mappedAdvocates = await Promise.all(
            savedAdvocates.map(async (user) => {
                if (user.profilePhoto) {
                    user.updateProfilePhoto(await this._s3Service.generateSignedUrl(user.profilePhoto));
                }
                if (user.bciCertificate) {
                    user.updateBciCirtificate(await this._s3Service.generateSignedUrl(user.bciCertificate));
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