import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../../types';
import { S3Service } from '../../infrastructure/web/s3Credential';
import { Logger } from 'winston';
import { HttpStatus } from '../../domain/share/enums';
import fs from 'fs';
import util from 'util';

const unlinkFile = util.promisify(fs.unlink);

@injectable()
export class ChatFileController {
  constructor(
    @inject(TYPES.S3Service) private s3Service: S3Service,
    @inject(TYPES.Logger) private logger: Logger
  ) { }

  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        this.logger.warn('No file uploaded', { path: req.path });
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, error: 'No file uploaded' });
        return;
      }

      const photoUrl = await this.s3Service.uploadFile(req.file);
      if (!photoUrl) {
        this.logger.error('Failed to upload file to S3', { file: req.file.originalname, path: req.path });
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: 'Failed to upload file to S3' });
        return;
      }

      // Delete local file
      try {
        await unlinkFile(req.file.path);
        this.logger.info('Local file deleted', { file: req.file.path });
      } catch (err) {
        this.logger.error('Failed to delete local file', { file: req.file.path, error: err });
      }

      // const chatPhoto = await this.s3Service.generateSignedUrl(photoUrl)

      this.logger.info('File uploaded successfully', { file: req.file.originalname, chatPhoto: photoUrl });

      res.status(HttpStatus.OK).json({
        success: true,
        url: photoUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
      });
    } catch (error: any) {
      // Delete local file on error
      if (req.file?.path) {
        try {
          await unlinkFile(req.file.path);
          this.logger.info('Local file deleted on error', { file: req.file.path });
        } catch (err) {
          this.logger.error('Failed to delete local file on error', { file: req.file.path, error: err });
        }
      }

      this.logger.error('File upload error', { error, file: req.file?.originalname, path: req.path });
      next(error); // Pass to global error middleware
    }
  }
}