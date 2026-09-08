import { Request, Response } from 'express';
import multer from 'multer';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';
import { ImageStorageService } from '../../services/image-storage.service.js';

// Multer memory storage configuration with 10MB limit and MIME validation
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid image type (${file.mimetype}). Allowed formats: JPEG, PNG, WebP.`));
    }
  },
});

export const uploadMiddleware = upload.single('file');
export const uploadMultipleMiddleware = upload.array('files', 10);

export class UploadController {
  // 1. Direct server-side upload to MySQL image storage
  static uploadImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file;
    const folder = (req.body.folder as 'products' | 'categories' | 'banners' | 'branding') || 'products';

    if (!file) {
      throw ApiError.badRequest('No image file provided for upload');
    }

    const savedImage = await ImageStorageService.saveImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );

    return res.status(201).json(
      ApiResponse.created(
        {
          id: savedImage.id,
          filename: savedImage.filename,
          url: savedImage.url,
          mimeType: savedImage.mimeType,
          fileSize: savedImage.fileSize,
        },
        'Image saved to MySQL successfully'
      )
    );
  });

  static getImage = asyncHandler(async (req: Request, res: Response) => {
    const image = await ImageStorageService.getImage(req.params.id);
    if (!image) {
      throw ApiError.notFound('Image not found');
    }

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(image.data);
  });

  // 3. Delete image from MySQL storage
  static deleteImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const imageId = req.params.id || req.body.id;

    if (!imageId) {
      throw ApiError.badRequest('image id is required for image deletion');
    }

    const deleted = await ImageStorageService.deleteImage(imageId);
    return res.status(200).json(
      ApiResponse.success({ deleted }, deleted ? 'Image deleted from MySQL' : 'Image not found')
    );
  });
}
