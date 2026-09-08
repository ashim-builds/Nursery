import path from 'path';
import { prisma } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export interface StoredImageResult {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  fileSize: number;
}

export class ImageStorageService {
  /**
   * Save uploaded image bytes directly in MySQL.
   */
  static async saveImage(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: 'products' | 'categories' | 'banners' | 'branding' = 'products'
  ): Promise<StoredImageResult> {
    const ext = path.extname(originalName).toLowerCase() || '.webp';
    const cleanBaseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .substring(0, 40);
    const filename = `${cleanBaseName || 'image'}${ext}`;
    const image = await prisma.imageAsset.create({
      data: { filename, mimeType, fileSize: buffer.length, data: new Uint8Array(buffer) },
    });

    return {
      id: image.id,
      filename,
      url: `/api/upload/image/${image.id}`,
      mimeType,
      fileSize: buffer.length,
    };
  }

  /**
   * Read an image from MySQL for the public image endpoint.
   */
  static async getImage(id: string) {
    return prisma.imageAsset.findUnique({
      where: { id },
      select: { data: true, mimeType: true },
    });
  }

  static async deleteImage(id: string): Promise<boolean> {
    if (!id) return false;
    try {
      await prisma.imageAsset.delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error?.code === 'P2025') return false;
      throw error;
    }
  }
}
