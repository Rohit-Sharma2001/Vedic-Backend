import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as multer from 'multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
 const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];


  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, MP4, and MOV are allowed.'), false);
  }
  cb(null, true);
};

// Helper function to dynamically create directories
const ensureDirectoryExists = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

@Injectable()
export class MulterMiddleware implements NestMiddleware {
  private upload = multer({
    storage: diskStorage({
      destination: (req, file, cb) => {
        let uploadFolder = './uploads/images';
        if (file.mimetype.startsWith('video')) {
          uploadFolder = './uploads/videos';
        }

        ensureDirectoryExists(uploadFolder);  // Ensure directory exists before saving
        cb(null, uploadFolder);
      },
     filename: (req, file, cb) => {
  const ext = extname(file.originalname);
  const rand = randomBytes(8).toString('hex'); // 16 chars
  const uniqueSuffix = `${Date.now()}-${rand}`;
  cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
},
    }),
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // Limit file size to 10MB for videos
    },
  });

  use = (req: Request, res: Response, next: NextFunction) => {
    this.upload.fields([
      { name: 'file', maxCount: 1 },   // Main image file
      { name: 'icon_file', maxCount: 1 },  // Icon file
      { name: 'video_file', maxCount: 1 },  // Video file
      { name: 'quote_image', maxCount: 1 } ,
      { name: 'career_image', maxCount: 1 } ,
      { name: 'coverImage', maxCount: 1 } ,
      { name: 'image', maxCount: 1 } ,
      { name: 'additionalImages', maxCount: 20 },
      { name: 'profile_images', maxCount: 10 },
      { name: 'document', maxCount: 1 }, // ✅ NEW field for Yoga Documents  // ✅ NEW FIELD for OurFamily
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).send({ message: err.message });
      }

      const uploadedFiles: any = req.files;
      const hostUrl = 'http://localhost:3000/uploads';

      // Process Image
      if (uploadedFiles && uploadedFiles['file']) {
        const file = uploadedFiles['file'][0];
        req.body.fileUrl = `${hostUrl}/images/${file.filename}`;
      }

      // Process Image
      if (uploadedFiles && uploadedFiles['quote_image']) {
        const file = uploadedFiles['quote_image'][0];
        req.body.fileUrl = `${hostUrl}/images/${file.filename}`;
      }
 
      if (uploadedFiles && uploadedFiles['career_image']) {
        const file = uploadedFiles['career_image'][0];
        req.body.fileUrl = `${hostUrl}/images/${file.filename}`;
      }

      // Process Icon
      if (uploadedFiles && uploadedFiles['icon_file']) {
        const iconFile = uploadedFiles['icon_file'][0];
        req.body.iconFileUrl = `${hostUrl}/images/${iconFile.filename}`;
      }

      // Process Video
      if (uploadedFiles && uploadedFiles['video_file']) {
        const videoFile = uploadedFiles['video_file'][0];
        req.body.videoFileUrl = `${hostUrl}/videos/${videoFile.filename}`;
        console.log('Video uploaded:', req.body.videoFileUrl);
      }
      if (uploadedFiles && uploadedFiles['profile_images']) {
  req.body.profileImageUrls = uploadedFiles['profile_images'].map(
    (img: Express.Multer.File) => `${hostUrl}/images/${img.filename}`
  );
}


      next();
    });
  };
  

// Function to check if file exists and generate URL
private checkFileExistence(filePath: string, filename: string, res: Response) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).send('File not found');
    }

    // If file exists, generate the URL
    const fileUrl = `http://localhost:3000/uploads/${filename}`;
    console.log(`File URL: ${fileUrl}`);  // This logs the file URL for your reference

    // You can return this URL in your response or assign it to the request object
    res.locals.fileUrl = fileUrl;
  });
}

}
