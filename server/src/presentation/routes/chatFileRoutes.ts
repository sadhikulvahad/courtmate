import express, { Request, Response, NextFunction } from 'express';
import { chatMediaUpload } from '../../infrastructure/web/multer';
import { createAuthMiddleware } from '../../infrastructure/web/authMiddlware';
import { JwtTokenService } from '../../infrastructure/services/jwt';
import { UserRepositoryImplement } from '../../infrastructure/dataBase/repositories/userRepository';
import { RefreshTokenUseCase } from '../../application/useCases/auth/refreshTokenUseCase';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

const tokenService = new JwtTokenService();
const userRepository = new UserRepositoryImplement();
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService, userRepository);
const authMiddleware = createAuthMiddleware(tokenService, refreshTokenUseCase);

router.post('/upload', authMiddleware, chatMediaUpload, (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const fileUrl = `/uploads/chat-media/${req.file.filename}`;

    res.status(200).json({
      url: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
    });
  } catch (error: unknown) {
    console.error('File upload error:', error);

    // Delete file if it was saved
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File too large. Maximum size is 20MB.' });
        return;
      }
      res.status(400).json({ error: `File upload failed: ${error.message}` });
      return;
    }

    // Pass other errors to global middleware
    next(error);
  }
});

export default router;