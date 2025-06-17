// multer.ts
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// Get absolute path to project root

const rootPath = path.join(__dirname, '../../../'); 
const uploadPath = path.join(rootPath, 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Normalize filename
  const originalname = file.originalname || '';
  const ext = path.extname(originalname).toLowerCase();
  const sanitizedMime = file.mimetype.toLowerCase();

  // Updated allowed types
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png',
    'application/pdf',
    'application/octet-stream' // Temporary allowance for debugging
  ];

  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.pdf'];

  // Special case for PDF files
  if (ext === '.pdf') {
    if (sanitizedMime === 'application/pdf') {
      return cb(null, true);
    }
    return cb(new Error('PDF files must have application/pdf MIME type'));
  }

  // Validate other files
  if (
    allowedMimeTypes.includes(sanitizedMime) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    console.error('Rejection details:', {
      originalname,
      sanitizedMime,
      ext,
      allowedMimeTypes,
      allowedExtensions
    });
    cb(new Error(`Invalid file: ${originalname} (${sanitizedMime})`));
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalName = `${Date.now()}-${sanitizedName}`;
    cb(null, finalName);
  }
});

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'bciCertificate', maxCount: 1 }
]);

const chatMediaFilter = (
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

  if (allowedMimeTypes.includes(sanitizedMime) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    console.error('Rejected chat media:', {
      originalname,
      sanitizedMime,
      ext,
    });
    cb(new Error(`Invalid file type: ${originalname} (${sanitizedMime})`));
  }
};

const chatMediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const chatMediaPath = path.join(uploadPath, 'chat-media');
    if (!fs.existsSync(chatMediaPath)) {
      fs.mkdirSync(chatMediaPath, { recursive: true });
    }
    cb(null, chatMediaPath);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalName = `${Date.now()}-${sanitizedName}`;
    cb(null, finalName);
  },
});

export const chatMediaUpload = multer({
  storage: chatMediaStorage,
  fileFilter: chatMediaFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
}).single('file');