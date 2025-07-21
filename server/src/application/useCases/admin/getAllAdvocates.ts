import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { AdvocateFilterOptions } from "../../types/UpdateAdvocateProfileDTO ";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { User } from "../../../domain/entities/User";
import { S3Service } from "../../../infrastructure/web/s3Credential";


@injectable()
export class GetAllAdvocates {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.S3Service) private s3Service: S3Service
  ) { }

  async execute(filters: AdvocateFilterOptions = {}) {
    try {
      const result = await this.userRepository.findAdvocatesWithFilters(filters);

      if (result.advocates.length === 0) {
        return {
          success: false,
          error: 'No advocates found matching the criteria'
        };
      }


      const advocatesWithSignedUrls = await Promise.all(
        result.advocates.map(async (advocate: User) => {
          if (advocate.profilePhoto) {
            const signedUrl = await this.s3Service.generateSignedUrl(advocate.profilePhoto);
            advocate.updateProfilePhoto(signedUrl);
          }
          if (advocate.bciCertificate) {
            const signedUrl = await this.s3Service.generateSignedUrl(advocate.bciCertificate);
            advocate.updateBciCirtificate(signedUrl)
          }
          return advocate;
        })
      );

      return {
        success: true,
        message: 'Advocates fetched successfully',
        data: {
          advocates: advocatesWithSignedUrls,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        }
        // data: result
      };
    } catch (error) {
      this.logger.error('Error fetching advocates:', { error })
      return {
        success: false,
        error: 'Failed to fetch advocates'
      };
    }
  }
}