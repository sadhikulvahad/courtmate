import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../../types';
import { GetAdvocateDetails } from '../../../application/useCases/advocate/GetDatails';
import { UpdateAdvocateProfile } from '../../../application/useCases/advocate/updateAdvocateProfile';
import { UpdateAdvocate } from '../../../application/useCases/advocate/UpdateAdvocate';
import { FindUser } from '../../../application/useCases/advocate/FindUser';
import { UpdateAdvocateProfileDTO } from '../../../application/types/UpdateAdvocateProfileDTO ';
import { HttpStatus } from '../../../domain/share/enums';
import { NotificationService } from '../../../infrastructure/services/notificationService';
import { Logger } from 'winston';
import { S3Service } from '../../../infrastructure/web/s3Credential';

@injectable()
export class advProfileController {
  constructor(
    @inject(TYPES.GetAdvocateDetails) private readonly GetAdvocateDetails: GetAdvocateDetails,
    @inject(TYPES.UpdateAdvocateProfile) private readonly UpdateAdvocateProfile: UpdateAdvocateProfile,
    @inject(TYPES.UpdateAdvocate) private readonly UpdateAdvocate: UpdateAdvocate,
    @inject(TYPES.FindUser) private readonly findUser: FindUser,
    @inject(TYPES.NotificationService) private readonly notificationService: NotificationService,
    @inject(TYPES.S3Service) private readonly uploadFileToS3: S3Service,
    @inject(TYPES.Logger) private readonly logger: Logger
  ) { }

  async getUser(req: Request, res: Response) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'Id missing' })
      }

      const result = await this.findUser.execute(id);

      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
      }

      return res.status(HttpStatus.OK).json({ success: true, message: result.message, user: result?.user });
    } catch (error: any) {
      this.logger.error('Error in getUser controller', { error, id: req.params.id });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server Error' });
    }
  }

  async getAdvocateDetail(req: Request, res: Response) {
    try {
      const id = req.query.id as string;
      const result = await this.GetAdvocateDetails.execute(id);
      if (!result?.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result?.error });
      }
      return res.status(HttpStatus.OK).json({ success: true, message: 'Data collected successfully', user: result?.user });
    } catch (error: any) {
      this.logger.error('Error in getAdvocateDetail controller', { error, id: req.query.id });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server error' });
    }
  }

  async updateAdvocateProfile(req: Request, res: Response) {
    try {
      const {
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
      } = req.body;

      const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'There is no user Id' });
      }

      if (!files || !files.profilePhoto || !files.bciCertificate) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: 'Both profile photo and BCI certificate are required',
        });
      }

      const [profilePhoto] = files.profilePhoto
      const [bciCertificate] = files.bciCertificate;

      let photoUrl: string = '';
      let cirtificateUrl: string = '';

      if (profilePhoto) {
        photoUrl = await this.uploadFileToS3.uploadFile(profilePhoto);
      }
      if (bciCertificate) {
        cirtificateUrl = await this.uploadFileToS3.uploadFile(bciCertificate);
      }

      // Validate file existence
      if (!photoUrl || !cirtificateUrl) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: 'Invalid file upload format',
        });
      }

      const result = await this.UpdateAdvocateProfile.execute(
        {
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
          profilePhotoPath: photoUrl,
          bciCertificatePath: cirtificateUrl,
        },
        this.notificationService
      );

      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
      }

      return res.status(HttpStatus.OK).json({ success: true, message: result.message });
    } catch (error: any) {
      this.logger.error('Error in updateAdvocateProfile controller', { error, id: req.body.id });
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server error' });
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
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'User ID is required' });
      }

      const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

      const profilePhotoFile = files?.profilePhoto?.[0];
      const bciCertificateFile = files?.bciCertificate?.[0];

      let photoUrl: string = oldProfilePhotoPath || '';
      let cirtificateUrl: string = oldBciCertificatePath || '';

      if (profilePhotoFile) {
        photoUrl = await this.uploadFileToS3.uploadFile(profilePhotoFile);
      }
      if (bciCertificateFile) {
        cirtificateUrl = await this.uploadFileToS3.uploadFile(bciCertificateFile);
      }

      const ageInt = age ? parseInt(age) : undefined;
      const yearsOfPracticeInt = yearsOfPractice ? parseInt(yearsOfPractice) : undefined;
      const languagesArray = languages ? languages.split(',').map((lang: string) => lang.trim()) : [];

      const updatePayload: UpdateAdvocateProfileDTO = {
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
        profilePhotoPath: photoUrl,
        bciCertificatePath: cirtificateUrl,
        age: ageInt,
        typeOfAdvocate,
        category,
        practicingField,
        languages: languagesArray,
        onlineConsultation,
        barCouncilNumber,
        yearsOfPractice: yearsOfPracticeInt,
      };

      const result = await this.UpdateAdvocate.execute(updatePayload);

      if (!result.success) {
        return res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: result.error });
      }

      return res.status(HttpStatus.OK).json({ success: true, message: result.message, userData: result.user });
    } catch (error: any) {
      this.logger.error('Error in updateAdvocate controller', { error, id: req.body.id });
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Server error' });
    }
  }
}