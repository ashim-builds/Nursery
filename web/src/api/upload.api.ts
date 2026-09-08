import { apiClient } from './client';

export interface UploadResponse {
  id?: string;
  url: string;
  mimeType?: string;
  fileSize?: number;
}

export const uploadApi = {
  // Direct upload
  uploadImage: async (file: File, folder = 'products'): Promise<UploadResponse> => {
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

  // Product Image Operations
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
