import { injectable, inject } from 'inversify';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request, RequestHandler } from 'express';
import { TYPES } from '../../types';
import { Logger } from 'winston';

@injectable()
export class MulterService {
  private profileUpload: RequestHandler;
  private chatMediaUpload: RequestHandler;

  constructor(@inject(TYPES.Logger) private logger: Logger) {
    this.profileUpload = this.createProfileUpload();
    this.chatMediaUpload = this.createChatMediaUpload();
  }

  private createProfileUpload(): RequestHandler {
    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      const originalname = file.originalname || '';
      const ext = path.extname(originalname).toLowerCase();
      const sanitizedMime = file.mimetype.toLowerCase();

      const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const allowedExtensions = ['.jpeg', '.jpg', '.png', '.pdf'];

      if (ext === '.pdf') {
        if (sanitizedMime === 'application/pdf') {
          return cb(null, true);
        }
        this.logger.error('Invalid PDF MIME type', { originalname, sanitizedMime });
        return cb(new Error('PDF files must have application/pdf MIME type'));
      }

      if (
        allowedMimeTypes.includes(sanitizedMime) &&
        allowedExtensions.includes(ext)
      ) {
        cb(null, true);
      } else {
        this.logger.error('Invalid file type for profile upload', {
          originalname,
          sanitizedMime,
          ext,
          allowedMimeTypes,
          allowedExtensions,
        });
        cb(new Error(`Invalid file: ${originalname} (${sanitizedMime})`));
      }
    };

    return multer({
      storage: multer.memoryStorage(),
      fileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }).fields([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'bciCertificate', maxCount: 1 },
    ]);
  }

  private createChatMediaUpload(): RequestHandler {
    const fileFilter = (
      req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      const originalname = file.originalname || '';
      const ext = path.extname(originalname).toLowerCase();
      const sanitizedMime = file.mimetype.toLowerCase();

      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      const allowedExtensions = [
        '.jpeg',
        '.jpg',
        '.png',
        '.gif',
        '.mp4',
        '.mov',
        '.avi',
        '.pdf',
        '.doc',
        '.docx',
        '.txt',
      ];

      if (
        allowedMimeTypes.includes(sanitizedMime) &&
        allowedExtensions.includes(ext)
      ) {
        cb(null, true);
      } else {
        this.logger.error('Invalid file type for chat media', {
          originalname,
          sanitizedMime,
          ext,
        });
        cb(new Error(`Invalid file type: ${originalname} (${sanitizedMime})`));
      }
    };

    return multer({
      storage: multer.memoryStorage(),
      fileFilter,
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }).single('file');
  }

  public getProfileUpload(): RequestHandler {
    return this.profileUpload;
  }

  public getChatMediaUpload(): RequestHandler {
    return this.chatMediaUpload;
  }
}
