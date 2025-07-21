

import { Types } from "mongoose";
import { UserRepository } from "../../../domain/interfaces/UserRepository";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { UpdateAdvocateProfileDTO } from "../../types/UpdateAdvocateProfileDTO ";
import { inject, injectable } from "inversify";
import { TYPES } from "../../../types";
import { Logger } from "winston";


@injectable()
export class UpdateAdvocateProfile {
    constructor(
        @inject(TYPES.UserRepository) private userRepository: UserRepository,
    ) { }

    async execute(data: UpdateAdvocateProfileDTO, notificationService: NotificationService) {

        if (!data.id) {
            return { success: false, error: "Id is missing" }
        }
        if (!data.age ||
            !data.barCouncilNumber ||
            !data.bciCertificatePath ||
            !data.category ||
            !data.city ||
            !data.country ||
            !data.languages ||
            !data.onlineConsultation ||
            !data.pincode ||
            !data.practicingField ||
            !data.profilePhotoPath ||
            !data.state ||
            !data.street ||
            !data.typeOfAdvocate ||
            !data.yearsOfPractice
        ) {
            return { success: false, error: "All fields are Required" }
        }

        const languages = data.languages.split(',').map(lang => lang.trim());
        const onlineConsultation = data.onlineConsultation == 'true';
        const yearsOfPractice = Number(data.yearsOfPractice || 0)

        const user = await this.userRepository.findById(data.id)
        const isBCINumberExist = await this.userRepository.findByBCINumber(data.barCouncilNumber)


        if (!user) {
            return { success: false, error: "There is no user with this Id" }
        }

        if (isBCINumberExist) {
            return { success: false, error: "This Bar Council India Reg No. is already Used, if it is not by you, please Contact the authorized person" }
        }

        await this.userRepository.update(data.id, {
            age: Number(data.age),
            barCouncilRegisterNumber: data.barCouncilNumber,
            category: data.category,
            address: {
                street: data.street,
                city: data.city,
                state: data.state,
                country: data.country,
                pincode: data.pincode
            },
            languages: languages,
            onlineConsultation: onlineConsultation,
            practicingField: data.practicingField,
            typeOfAdvocate: data.typeOfAdvocate,
            experience: yearsOfPractice,
            profilePhoto: data.profilePhotoPath,
            bciCertificate: data.bciCertificatePath,
            isAdminVerified: 'Pending'
        })

        const admin = await this.userRepository.findByEmail('sadhikulvahad@gmail.com')

        await notificationService.sendNotification({
            recieverId: new Types.ObjectId(admin?.id),
            senderId: new Types.ObjectId(user?.id),
            message: `${user.name} sended Advocate Request`,
            read: false,
            type: 'Notification',
            createdAt: new Date()
        })

        return { success: true, message: 'Request send successfully' }
    }
}