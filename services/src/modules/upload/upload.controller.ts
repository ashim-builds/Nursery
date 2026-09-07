import { Request, Response } from 'express';
import multer from 'multer';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { cloudinary } from '../../config/cloudinary.js';
import { ApiError } from '../../utils/ApiError.js';
import { ENV } from '../../config/env.js';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware.js';

// Multer memory storage configuration with 10MB limit and MIME validation
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
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
      cb(new Error(`Invalid image type (${file.mimetype}). Supported formats: JPEG, PNG, WebP, AVIF, GIF.`));
    }
  },
});

export const uploadMiddleware = upload.single('file');
export const uploadMultipleMiddleware = upload.array('files', 10);

// Helper to generate Cloudinary transformed URLs
export const buildCloudinaryTransforms = (urlOrPublicId: string) => {
  if (!urlOrPublicId) return {};

  // If it's a full Cloudinary URL, inject transformations into the URL path
  if (urlOrPublicId.includes('res.cloudinary.com') && urlOrPublicId.includes('/upload/')) {
    const parts = urlOrPublicId.split('/upload/');
    const base = parts[0] + '/upload/';
    const path = parts[1];

    return {
      thumbnail: `${base}c_fill,g_auto,w_150,h_150,q_auto,f_auto/${path}`,
      card: `${base}c_fill,g_auto,w_500,h_500,q_auto,f_auto/${path}`,
      detail: `${base}c_limit,w_1000,h_1000,q_auto,f_auto/${path}`,
      zoom: `${base}c_limit,w_1800,h_1800,q_auto:best,f_auto/${path}`,
      srcset: `${base}c_fill,w_360,q_auto,f_auto/${path} 360w, ${base}c_fill,w_640,q_auto,f_auto/${path} 640w, ${base}c_fill,w_960,q_auto,f_auto/${path} 960w, ${base}c_limit,w_1200,q_auto,f_auto/${path} 1200w`,
    };
  }

  // Fallback if not a standard Cloudinary URL (e.g. Unsplash or local)
  return {
    thumbnail: urlOrPublicId,
    card: urlOrPublicId,
    detail: urlOrPublicId,
    zoom: urlOrPublicId,
    srcset: `${urlOrPublicId} 1x`,
  };
};

export class UploadController {
  // 1. Returns secure signed upload signature for direct client-to-Cloudinary admin uploads
  static getUploadSignature = asyncHandler(async (req: Request, res: Response) => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = (req.query.folder as string) || 'nursery_botanica/products';

    if (!ENV.CLOUDINARY_API_SECRET || !ENV.CLOUDINARY_API_KEY || !ENV.CLOUDINARY_CLOUD_NAME) {
      return res.status(200).json(
        ApiResponse.success(
          {
            timestamp,
            folder,
            cloudName: 'demo_nursery_cloud',
            apiKey: 'demo_key',
            signature: 'demo_signature',
            isDemo: true,
          },
          'Cloudinary signature generated (Demo mode - Cloudinary credentials not configured)'
        )
      );
    }

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      ENV.CLOUDINARY_API_SECRET
    );

    res.status(200).json(
      ApiResponse.success(
        {
          timestamp,
          folder,
          cloudName: ENV.CLOUDINARY_CLOUD_NAME,
          apiKey: ENV.CLOUDINARY_API_KEY,
          signature,
          isDemo: false,
        },
        'Cloudinary secure upload signature generated'
      )
    );
  });

  // 2. Direct Server-Side Upload with Validation & Cloudinary Processing
  static uploadImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file;
    const bodyUrl = req.body.url;
    const folder = (req.body.folder as string) || 'nursery_botanica/products';

    if (!file && !bodyUrl) {
      throw ApiError.badRequest('No image file or URL provided for upload');
    }

    // Direct Cloudinary Upload if credentials exist
    if (ENV.CLOUDINARY_API_SECRET && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_CLOUD_NAME) {
      if (file) {
        // Stream buffer upload to Cloudinary
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'image',
              quality: 'auto',
              fetch_format: 'auto',
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });

        const transforms = buildCloudinaryTransforms(uploadResult.secure_url);

        return res.status(201).json(
          ApiResponse.created(
            {
              publicId: uploadResult.public_id,
              url: uploadResult.secure_url,
              secureUrl: uploadResult.secure_url,
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format,
              bytes: uploadResult.bytes,
              transformations: transforms,
            },
            'Image uploaded and optimized via Cloudinary'
          )
        );
      } else if (bodyUrl) {
        // Upload remote URL to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(bodyUrl, {
          folder,
          resource_type: 'image',
        });

        const transforms = buildCloudinaryTransforms(uploadResult.secure_url);

        return res.status(201).json(
          ApiResponse.created(
            {
              publicId: uploadResult.public_id,
              url: uploadResult.secure_url,
              secureUrl: uploadResult.secure_url,
              width: uploadResult.width,
              height: uploadResult.height,
              format: uploadResult.format,
              bytes: uploadResult.bytes,
              transformations: transforms,
            },
            'Remote image ingested to Cloudinary'
          )
        );
      }
    }

    // Fallback in local/demo mode if Cloudinary is unconfigured
    const fallbackUrl =
      bodyUrl ||
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80';

    return res.status(200).json(
      ApiResponse.success(
        {
          publicId: `nursery_local_${Date.now()}`,
          url: fallbackUrl,
          secureUrl: fallbackUrl,
          width: 800,
          height: 800,
          format: 'jpg',
          bytes: file ? file.size : 120000,
          transformations: buildCloudinaryTransforms(fallbackUrl),
          isFallback: true,
        },
        'Image processed (Local fallback mode)'
      )
    );
  });

  // 3. Delete Image from Cloudinary
  static deleteImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const publicId = req.params.publicId || req.body.publicId;

    if (!publicId) {
      throw ApiError.badRequest('Public ID is required for image deletion');
    }

    if (ENV.CLOUDINARY_API_SECRET && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_CLOUD_NAME) {
      const result = await cloudinary.uploader.destroy(publicId);
      return res.status(200).json(ApiResponse.success(result, 'Image deleted from Cloudinary storage'));
    }

    return res.status(200).json(ApiResponse.success({ result: 'ok' }, 'Image delete request processed (Local mode)'));
  });
}
