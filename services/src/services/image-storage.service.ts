import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export interface StoredImageResult {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
}

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

// Ensure base upload folders exist
const ensureDirExists = async (dirPath: string) => {
  try {
    await fs.promises.access(dirPath);
  } catch {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
};

export class ImageStorageService {
  /**
   * Save uploaded image to server-side filesystem storage and store metadata in MySQL.
   */
  static async saveImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: 'products' | 'categories' | 'banners' | 'branding' = 'products'
  ): Promise<StoredImageResult> {
    // 1. Validate file extension and MIME type
    const allowedExtensions: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    const ext = allowedExtensions[mimeType.toLowerCase()] || path.extname(originalName).toLowerCase() || '.webp';
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      throw ApiError.badRequest('Unsupported image format. Allowed formats: JPEG, PNG, WebP');
    }

    // 2. Generate secure, collision-resistant unique filename
    const uniqueId = crypto.randomUUID();
    const cleanBaseName = path
      .basename(originalName, path.extname(originalName))
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .substring(0, 30);
    const filename = `${folder}-${cleanBaseName}-${uniqueId}${ext}`;

    const folderDir = path.join(UPLOADS_ROOT, folder);
    await ensureDirExists(folderDir);

    const filePath = path.join(folderDir, filename);
    const storagePath = `uploads/${folder}/${filename}`;

    // 3. Write physical file to disk
    await fs.promises.writeFile(filePath, buffer);

    // 4. Save metadata in MySQL (Zero BLOBs) with direct static URL for maximum performance
    const publicUrl = `/${storagePath}`;
    const image = await prisma.imageAsset.create({
      data: {
        id: uniqueId,
        filename,
        storagePath,
        url: publicUrl,
        mimeType,
        fileSize: buffer.length,
      },
    });

    return {
      id: image.id,
      filename,
      url: image.url,
      mimeType,
      fileSize: buffer.length,
      storagePath,
    };
  }

  /**
   * Save a base64 data URI to physical disk and return the public static URL.
   */
  static async saveBase64Image(
    dataUri: string,
    folder: 'products' | 'categories' | 'banners' | 'branding' = 'products'
  ): Promise<string> {
    if (!dataUri || !dataUri.startsWith('data:image/')) {
      return dataUri;
    }

    try {
      const match = dataUri.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) return dataUri;

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const ext = mimeType.includes('png') ? '.png' : mimeType.includes('webp') ? '.webp' : '.jpg';

      const uniqueId = crypto.randomUUID();
      const filename = `${folder}-opt-${uniqueId}${ext}`;
      const folderDir = path.join(UPLOADS_ROOT, folder);
      await ensureDirExists(folderDir);

      const filePath = path.join(folderDir, filename);
      const storagePath = `uploads/${folder}/${filename}`;
      await fs.promises.writeFile(filePath, buffer);

      const publicUrl = `/${storagePath}`;
      try {
        await prisma.imageAsset.create({
          data: {
            id: uniqueId,
            filename,
            storagePath,
            url: publicUrl,
            mimeType,
            fileSize: buffer.length,
          },
        });
      } catch (dbErr) {
        // Continue even if imageAsset table insert fails
      }

      return publicUrl;
    } catch (error) {
      console.error('Failed to extract and persist base64 image to disk:', error);
      return dataUri;
    }
  }

  /**
   * Read an image from disk for streaming via API endpoint.
   */
  static async getImage(id: string) {
    const record = await prisma.imageAsset.findUnique({
      where: { id },
      select: { id: true, filename: true, storagePath: true, mimeType: true, fileSize: true },
    });

    if (!record) return null;

    const fullPath = path.resolve(process.cwd(), record.storagePath);
    try {
      await fs.promises.access(fullPath);
      const data = await fs.promises.readFile(fullPath);
      return {
        data,
        mimeType: record.mimeType,
        filename: record.filename,
      };
    } catch {
      return null;
    }
  }

  /**
   * Delete an image from disk and remove its metadata from MySQL.
   */
  static async deleteImage(id: string): Promise<boolean> {
    if (!id) return false;
    try {
      const record = await prisma.imageAsset.findUnique({
        where: { id },
        select: { storagePath: true },
      });

      if (record) {
        const fullPath = path.resolve(process.cwd(), record.storagePath);
        try {
          await fs.promises.unlink(fullPath);
        } catch {
          // File might have already been removed
        }
        await prisma.imageAsset.delete({ where: { id } });
        return true;
      }
      return false;
    } catch (error: any) {
      if (error?.code === 'P2025') return false;
      throw error;
    }
  }
}

