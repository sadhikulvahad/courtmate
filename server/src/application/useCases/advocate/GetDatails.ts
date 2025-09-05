import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { IGetAdvocateDetails } from "../../../application/interface/advocate/GetDetailsRepo";
import { GetAdvocateDetailsDTO } from "../../../application/dto";

@injectable()
export class GetAdvocateDetails implements IGetAdvocateDetails {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.Logger) private _logger: Logger,
        @inject(TYPES.S3Service) private _s3Service: S3Service
    ) { }

    async execute(id: string) : Promise<GetAdvocateDetailsDTO> {
        try {
            if (!id) {
                return { success: false, error: "No Id Provided" }
            }
            const user = await this._userRepository.findById(id)
            if (!user) {
                return { success: false, error: "No User with this id" }
            }

            if (user?.profilePhoto) {
                const signedUrl = await this._s3Service.generateSignedUrl(user.profilePhoto);
                const bciSignedurl = await this._s3Service.generateSignedUrl(user.bciCertificate);
                user.updateProfilePhoto(signedUrl)
                user.updateBciCirtificate(bciSignedurl);
            }
            return {
                success: true,
                message: "User detail got successfully",
                user: user
            }
        } catch (error) {
            this._logger.error('Error from GetAdvocateDetails usecase', { error })
            return { success: false, error: "" }
        }
    }
}