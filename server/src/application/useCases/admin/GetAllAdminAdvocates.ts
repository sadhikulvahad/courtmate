import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { AdvocateFilterOptions } from "../../../application/types/UpdateAdvocateProfileDTO ";
import { TYPES } from "../../../types";
import { Logger } from "winston";
import { User } from "../../../domain/entities/User";
import { UserProps } from "../../../domain/types/EntityProps";
import { S3Service } from "../../../infrastructure/web/s3Credential";

@injectable()
export class GetAllAdminAdvocates {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: UserRepository,
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.S3Service) private s3Service: S3Service
  ) { }

  async execute(filters: AdvocateFilterOptions = {}) {
    try {
      const result = await this.userRepository.findAdminAdvocates(filters);

      const mappedAdvocates = await Promise.all(
        result.advocates.map(async (mongooseUser: UserProps) => {
          const user = this.toDomainEntity(mongooseUser);

          if (user.profilePhoto) {
            user.updateProfilePhoto(await this.s3Service.generateSignedUrl(user.profilePhoto));
          }
          if (user.bciCertificate) {
            user.updateBciCirtificate(await this.s3Service.generateSignedUrl(user.bciCertificate));
          }

          return user;
        })
      );
      return {
        success: true,
        message: "Admin advocates fetched successfully",
        data: {
          advocates: mappedAdvocates,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      };
    } catch (error) {
      this.logger.error("Error fetching admin advocates:", { error });
      return {
        success: false,
        error: "Failed to fetch admin advocates",
      };
    }
  }

  private toDomainEntity(mongooseUser: UserProps): User {
    return new User({
      _id: mongooseUser?._id?.toString(),
      name: mongooseUser.name,
      email: mongooseUser.email,
      phone: mongooseUser.phone,
      password: mongooseUser.password,
      role: mongooseUser.role,
      googleId: mongooseUser.googleId,
      authMethod: mongooseUser.authMethod,
      isActive: mongooseUser.isActive,
      isBlocked: mongooseUser.isBlocked,
      isVerified: mongooseUser.isVerified,
      isAdminVerified: mongooseUser.isAdminVerified,
      verifiedAt: mongooseUser.verifiedAt,
      address: mongooseUser.address,
      certification: mongooseUser.certification,
      bio: mongooseUser.bio,
      languages: mongooseUser.languages,
      barCouncilRegisterNumber: mongooseUser.barCouncilRegisterNumber,
      barCouncilIndia: mongooseUser.barCouncilIndia,
      typeOfAdvocate: mongooseUser.typeOfAdvocate,
      experience: mongooseUser.experience,
      category: mongooseUser.category,
      practicingField: mongooseUser.practicingField,
      profilePhoto: mongooseUser.profilePhoto,
      bciCertificate: mongooseUser.bciCertificate,
      age: mongooseUser.age,
      DOB: mongooseUser.DOB,
      onlineConsultation: mongooseUser.onlineConsultation,
      savedAdvocates: mongooseUser.savedAdvocates ?? [],
      subscriptionPlan: mongooseUser.subscriptionPlan,
      isSponsored: mongooseUser.isSponsored,
    });
  }
}