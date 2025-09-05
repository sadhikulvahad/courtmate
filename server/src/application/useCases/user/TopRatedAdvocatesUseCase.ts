import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { UserProps } from "../../../domain/types/EntityProps";
import { ITopRatedAdvocatesUsecase } from "../../../application/interface/user/TopRatedAdvocateUsecaseRepo";

@injectable()
export class TopRatedAdvocatesUseCase implements ITopRatedAdvocatesUsecase {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.S3Service) private _s3Service: S3Service
    ) { }

    async execute(): Promise<UserProps[]> {
        const advocates = await this._userRepository.topRatedAdvocates();

        const mappedAdvocates = await Promise.all(
            advocates.map(async (user) => {
                if (user.profilePhoto) {
                    user.updateProfilePhoto(await this._s3Service.generateSignedUrl(user.profilePhoto));
                }
                if (user.bciCertificate) {
                    user.updateBciCirtificate(await this._s3Service.generateSignedUrl(user.bciCertificate));
                }
                // ✅ Return everything from props, fully.
                return user.toJSON()
            })
        );

        return mappedAdvocates;
    }
}