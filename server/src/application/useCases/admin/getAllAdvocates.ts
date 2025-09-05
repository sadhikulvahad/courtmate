import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../domain/interfaces/UserRepository";
import { AdvocateFilterOptions } from "../../types/UpdateAdvocateProfileDTO ";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { User } from "../../../domain/entities/User";
import { S3Service } from "../../../infrastructure/web/s3Credential";
import { IGetAllAdvocates } from "../../../application/interface/admin/GetAllAdvocatesRepo";
import { AllAdminAdvocatesDTO } from "../../../application/dto";


@injectable()
export class GetAllAdvocates implements IGetAllAdvocates {
  constructor(
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.Logger) private _logger: Logger,
    @inject(TYPES.S3Service) private _s3Service: S3Service
  ) { }

  async execute(filters: AdvocateFilterOptions = {}): Promise<AllAdminAdvocatesDTO> {
    try {
      const result = await this._userRepository.findAdvocatesWithFilters(filters);
      if (result.advocates.length === 0) {
        return {
          success: false,
          error: 'No advocates found matching the criteria'
        };
      }


      const advocatesWithSignedUrls = await Promise.all(
        result.advocates.map(async (advocate: User) => {
          if (advocate.profilePhoto) {
            const signedUrl = await this._s3Service.generateSignedUrl(advocate.profilePhoto);
            advocate.updateProfilePhoto(signedUrl);
          }
          if (advocate.bciCertificate) {
            const signedUrl = await this._s3Service.generateSignedUrl(advocate.bciCertificate);
            advocate.updateBciCirtificate(signedUrl)
          }
          return advocate;
        })
      );
      return {
        advocates: advocatesWithSignedUrls,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };
    } catch (error) {
      this._logger.error('Error fetching advocates:', { error })
      return {
        success: false,
        error: 'Failed to fetch advocates'
      };
    }
  }
}