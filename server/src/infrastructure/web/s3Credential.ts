import { injectable, inject } from 'inversify';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import path from 'path';
import { TYPES } from '../../types';
import { Logger } from 'winston';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@injectable()
export class S3Service {
  private s3: S3Client;

  constructor(@inject(TYPES.Logger) private logger: Logger) {
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY ||
      !process.env.AWS_SECRET_KEY ||
      !process.env.AWS_BUCKET_NAME
    ) {
      this.logger.error('Missing AWS S3 environment variables');
      throw new Error('AWS S3 configuration is incomplete');
    }

    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `uploads/${uuid()}${fileExtension}`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      this.logger.info('Uploading file to S3', { fileName, mimeType: file.mimetype });
      const command = new PutObjectCommand(uploadParams);
      await this.s3.send(command);

      this.logger.info('File uploaded successfully', { fileName });

      return fileName;

    } catch (error: any) {
      this.logger.error('Error uploading file to S3', {
        error: error.message,
        fileName: file.originalname,
      });
      throw error;
    }
  }

  async generateSignedUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 86400 });
    return url;
  }
}