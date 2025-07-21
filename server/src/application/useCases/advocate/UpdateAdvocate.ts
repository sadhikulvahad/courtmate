import { inject, injectable } from "inversify";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { UpdateAdvocateProfileDTO } from "../../types/UpdateAdvocateProfileDTO ";
import { TYPES } from "../../../types";
import { S3Service } from "../../../infrastructure/web/s3Credential";


@injectable()
export class UpdateAdvocate {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
        @inject(TYPES.S3Service) private s3Service : S3Service
    ) { }

    async execute(data: UpdateAdvocateProfileDTO) {
        if (!data.id) {
            return { success: false, error: "Id is missing" };
        }

        const user = await this.userRepository.findById(data.id);
        if (!user) {
            return { success: false, error: "No user found with this ID" };
        }

        // Build update payload dynamically
        const updatePayload: any = {};

        if (data.name) updatePayload.name = data.name;
        if (data.email) updatePayload.email = data.email;
        if (data.phone) updatePayload.phone = data.phone;
        if (data.age) updatePayload.age = Number(data.age);
        if (data.bio) updatePayload.bio = data.bio;
        if (data.profilePhotoPath) updatePayload.profilePhoto = data.profilePhotoPath;
        if (data.bciCertificatePath) updatePayload.bciCertificate = data.bciCertificatePath;

        // Advocate-specific fields
        if (data.barCouncilNumber) updatePayload.barCouncilRegisterNumber = data.barCouncilNumber;
        if (data.yearsOfPractice) updatePayload.experience = Number(data.yearsOfPractice);
        if (data.typeOfAdvocate) updatePayload.typeOfAdvocate = data.typeOfAdvocate;
        if (data.category) updatePayload.category = data.category;
        if (data.practicingField) updatePayload.practicingField = data.practicingField;

        if (data.onlineConsultation !== undefined) {
            updatePayload.onlineConsultation = data.onlineConsultation === 'true';
        }


        if (data.languages && Array.isArray(data.languages)) {
            updatePayload.languages = data.languages.map((lang: string) => lang.trim());
        }

        if (data.street || data.city || data.state || data.country || data.pincode) {
            updatePayload.address = {
                street: data.street || user.address?.street,
                city: data.city || user.address?.city,
                state: data.state || user.address?.state,
                country: data.country || user.address?.country,
                pincode: data.pincode || user.address?.pincode
            };
        }

        // Auto-set admin verification for advocates (optional)
        if (data.barCouncilNumber || data.bciCertificatePath || data.typeOfAdvocate) {
            updatePayload.isAdminVerified = "Accepted";
        }

        const updatedUser = await this.userRepository.update(data.id, updatePayload);

        if (updatedUser?.profilePhoto) {
                const signedUrl = await this.s3Service.generateSignedUrl(updatedUser.profilePhoto);
                const bciSignedurl = await this.s3Service.generateSignedUrl(updatedUser.bciCertificate);
                updatedUser.updateProfilePhoto(signedUrl)
                updatedUser.updateBciCirtificate(bciSignedurl);
            }

        return {
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        };
    }

}