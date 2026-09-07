import { apiClient } from './client';

export interface UploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  transformations: {
    thumbnail: string;
    card: string;
    detail: string;
    zoom: string;
    srcset?: string;
  };
}

export interface UploadSignatureResponse {
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
  signature: string;
  isDemo: boolean;
}

export const uploadApi = {
  // 1. Direct server-side upload with file buffer
  uploadImage: async (file: File, folder = 'nursery_botanica/products'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  // 2. Upload from remote URL
  uploadFromUrl: async (url: string, folder = 'nursery_botanica/products'): Promise<UploadResponse> => {
    const res = await apiClient.post('/upload/image', { url, folder });
    return res.data.data;
  },

  // 3. Get signed upload signature for direct Cloudinary upload
  getSignature: async (folder = 'nursery_botanica/products'): Promise<UploadSignatureResponse> => {
    const res = await apiClient.get('/upload/signature', { params: { folder } });
    return res.data.data;
  },

  // 4. Delete image
  deleteImage: async (publicId: string): Promise<void> => {
    await apiClient.post('/upload/delete', { publicId });
  },

  // 5. Product Image Operations
  addProductImage: async (
    productId: string,
    imageData: { url: string; altText?: string; isPrimary?: boolean; sortOrder?: number }
  ) => {
    const res = await apiClient.post(`/admin/products/${productId}/images`, imageData);
    return res.data.data;
  },

  deleteProductImage: async (productId: string, imageId: string) => {
    const res = await apiClient.delete(`/admin/products/${productId}/images/${imageId}`);
    return res.data.data;
  },

  setPrimaryImage: async (productId: string, imageId: string) => {
    const res = await apiClient.patch(`/admin/products/${productId}/images/${imageId}/primary`);
    return res.data.data;
  },

  reorderProductImages: async (
    productId: string,
    images: Array<{ id: string; sortOrder: number }>
  ) => {
    const res = await apiClient.put(`/admin/products/${productId}/images/reorder`, { images });
    return res.data.data;
  },
};
