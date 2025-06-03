import { Request, Response } from "express";
import { UserRepositoryImplement } from "../../../infrastructure/dataBase/repositories/userRepository";
import { GetAdvocateDetails } from "../../../application/useCases/advocate/GetDatails";
import { UpdateAdvocateProfile } from "../../../application/useCases/advocate/updateAdvocateProfile";
import { NotificationRepositoryImplements } from "../../../infrastructure/dataBase/repositories/NotificationRepository";
import { NotificationService } from "../../../infrastructure/services/notificationService";
import { FindUser } from "../../../application/useCases/advocate/FindUser";
import { UpdateAdvocate } from "../../../application/useCases/advocate/UpdateAdvocate";
import { UpdateAdvocateProfileDTO } from "../../../application/types/UpdateAdvocateProfileDTO ";


export class advProfileController {

    private readonly GetAdvocateDetails: GetAdvocateDetails
    private readonly UpdateAdvocateProfile: UpdateAdvocateProfile
    private readonly UpdateAdvocate: UpdateAdvocate
    private readonly findUser: FindUser

    constructor() {
        const userRepository = new UserRepositoryImplement()
        this.GetAdvocateDetails = new GetAdvocateDetails(userRepository)
        this.UpdateAdvocateProfile = new UpdateAdvocateProfile(userRepository)
        this.UpdateAdvocate = new UpdateAdvocate(userRepository)
        this.findUser = new FindUser(userRepository)
    }

    async getUser(req: Request, res: Response) {
        try {
            const id = req.params.id
            const result = await this.findUser.execute(id)

            if (!result.success) {
                return res.status(400).json({ success: false, error: result.error })
            }

            return res.status(200).json({ success: true, message: result.message, user: result?.user })
        } catch (error) {
            console.log("Error from get User controller", error)
            res.status(500).json({ success: false, error: 'Server Error' })
        }
    }

    async getAdvocateDetail(req: Request, res: Response) {
        try {
            const id = req.query.id as string
            const result = await this.GetAdvocateDetails.execute(id)
            if (!result?.success) {
                return res.status(400).json({ success: false, error: result?.error })
            }
            return res.status(200).json({ success: true, message: 'Data collected successfully', user: result?.user })
        } catch (error) {
            console.error("Error from advocate profile controller, get details", error)
            res.status(500).json({ success: false, error: "Server error" })
        }
    }

    async updateAdvocateProfile(req: Request, res: Response) {
        const io = req.app.get('io')
        try {
            const { id,
                barCouncilNumber,
                yearsOfPractice,
                age,
                typeOfAdvocate,
                category,
                practicingField,
                languages,
                street,
                city,
                state,
                country,
                pincode,
                onlineConsultation,
            } = req.body

            const files = req.files as {
                [key: string]: Express.Multer.File[]
            } | undefined;

            if (!id) {
                return res.status(400).json({ success: false, error: "There is no user Id" })
            }

            if (!files || !files.profilePhoto || !files.bciCertificate) {
                return res.status(400).json({
                    success: false,
                    error: 'Both profile photo and BCI certificate are required'
                });
            }



            const [profilePhoto] = files.profilePhoto;
            const [bciCertificate] = files.bciCertificate;

            // Validate file existence
            if (!profilePhoto || !bciCertificate) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file upload format'
                });
            }

            const notificaitonRepo = new NotificationRepositoryImplements()
            const notificationService = new NotificationService(notificaitonRepo, io)

            const result = await this.UpdateAdvocateProfile.execute({
                id,
                barCouncilNumber,
                yearsOfPractice,
                age,
                typeOfAdvocate,
                category,
                practicingField,
                languages,
                street,
                city,
                state,
                country,
                pincode,
                onlineConsultation,
                profilePhotoPath: profilePhoto.filename,
                bciCertificatePath: bciCertificate.filename,
            }, notificationService);

            if (!result.success) {
                return res.status(400).json({ success: false, error: result.error })
            }

            return res.status(200).json({ success: true, message: result.message })
        } catch (error) {
            console.error("Error from advocate profile controller, updateAdvocateProfile", error)
            res.status(500).json({ success: false, error: "Server error" })
        }
    }

    async updateAdvocate(req: Request, res: Response) {
        try {
            const {
                id,
                name,
                email,
                phone,
                street,
                city,
                state,
                country,
                age,
                typeOfAdvocate,
                category,
                practicingField,
                pincode,
                languages,
                onlineConsultation,
                bciCertificate: oldBciCertificatePath,
                profilePhoto: oldProfilePhotoPath,
                barCouncilNumber,
                yearsOfPractice,
                bio,
            } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, error: "User ID is required" });
            }

            const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

            // Get uploaded files (if present)
            const profilePhotoFile = files?.profilePhoto?.[0];
            const bciCertificateFile = files?.bciCertificate?.[0];

            // For regular users, you might not want this strict validation
            // Remove this if you're supporting non-advocate users too
            // Optional: Only enforce profile photo for advocates
            const profilePhotoPath = profilePhotoFile ? profilePhotoFile.filename : oldProfilePhotoPath;
            const bciCertificatePath = bciCertificateFile ? bciCertificateFile.filename : oldBciCertificatePath;

            // Convert strings to proper types
            const ageInt = age ? parseInt(age) : undefined;
            const yearsOfPracticeInt = yearsOfPractice ? parseInt(yearsOfPractice) : undefined;
            const languagesArray = languages ? languages.split(",").map((lang: string) => lang.trim()) : [];

            // Build the update payload dynamically
            const updatePayload: Record<string, any> = {
                id,
                name,
                email,
                phone,
                street,
                city,
                state,
                country,
                pincode,
                bio,
                profilePhotoPath,
            };

            // Only include advocate-specific fields if they exist
            if (ageInt) updatePayload.age = ageInt;
            if (typeOfAdvocate) updatePayload.typeOfAdvocate = typeOfAdvocate;
            if (category) updatePayload.category = category;
            if (practicingField) updatePayload.practicingField = practicingField;
            if (languagesArray.length) updatePayload.languages = languagesArray;
            if (onlineConsultation !== undefined) updatePayload.onlineConsultation = onlineConsultation;
            if (barCouncilNumber) updatePayload.barCouncilNumber = barCouncilNumber;
            if (yearsOfPracticeInt) updatePayload.yearsOfPractice = yearsOfPracticeInt;
            if (bciCertificatePath) updatePayload.bciCertificatePath = bciCertificatePath;

            const result = await this.UpdateAdvocate.execute(updatePayload as UpdateAdvocateProfileDTO);


            if (!result.success) {
                return res.status(400).json({ success: false, error: result.error });
            }

            return res.status(200).json({ success: true, message: result.message, userData: result.user });
        } catch (error) {
            console.error("Error from advocate update controller:", error);
            return res.status(500).json({ success: false, error: "Server error" });
        }
    }


}