import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { IFindUser } from "../../../application/interface/advocate/FindUserRepo";
import { FindUserDTO } from "../../../application/dto";


@injectable()
export class FindUser implements IFindUser {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.S3Service) private _s3Service: S3Service
    ) { }

    async execute(id: string) : Promise<FindUserDTO> {
        if (!id) {
            return { success: false, error: 'Id is not provided' }
        }

        const user = await this._userRepository.findById(id)

        if (user?.profilePhoto) {
            const signedUrl = await this._s3Service.generateSignedUrl(user.profilePhoto);
            const bciSignedurl = await this._s3Service.generateSignedUrl(user.bciCertificate);
            user.updateProfilePhoto(signedUrl)
            user.updateBciCirtificate(bciSignedurl);
        }

        if (!user) {
            return { success: false, error: "User not found" }
        }
        return {
            user: user
        }

    }
}
