import type { IImageRepository } from '../../Domain/repositories/IImageRepository';
import type { Image } from '../../Domain/models/Image';
import type { Comment } from '../../Domain/models/Comment';
import type { ApiResponse, PaginatedResponse } from '../../Domain/DTOs/ApiResponse';
import axiosInstance from '../axios.config';

export class ImageRepository implements IImageRepository {
  async getImages(page: number, pageSize: number, category?: string, search?: string): Promise<ApiResponse<PaginatedResponse<Image>>> {
    try {
      const params: any = { page, pageSize };
      if (category) params.category = category;
      if (search) params.search = search;

      const response = await axiosInstance.get('/images', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch images'
      };
    }
  }

  async getPopularImages(page: number, pageSize: number): Promise<ApiResponse<PaginatedResponse<Image>>> {
    try {
      const response = await axiosInstance.get('/images/popular', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch popular images'
      };
    }
  }

  async getUserImages(userId: number, page: number, pageSize: number): Promise<ApiResponse<PaginatedResponse<Image>>> {
    try {
      const response = await axiosInstance.get(`/images/user/${userId}`, {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user images'
      };
    }
  }

  async getImageById(id: number): Promise<ApiResponse<Image>> {
    try {
      const response = await axiosInstance.get(`/images/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch image'
      };
    }
  }

  async createImage(formData: FormData): Promise<ApiResponse<Image>> {
    try {
      const response = await axiosInstance.post('/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create image'
      };
    }
  }

  async updateImage(id: number, data: any): Promise<ApiResponse<Image>> {
    try {
      const response = await axiosInstance.put(`/images/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update image'
      };
    }
  }

  async deleteImage(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/images/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete image'
      };
    }
  }

  async likeImage(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.post(`/images/${id}/like`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to like image'
      };
    }
  }

  async unlikeImage(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.post(`/images/${id}/unlike`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to unlike image'
      };
    }
  }

  async saveImage(id: number, collectionId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.post(`/images/${id}/save`, { collectionId });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to save image'
      };
    }
  }

  async unsaveImage(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.post(`/images/${id}/unsave`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to unsave image'
      };
    }
  }

  async getComments(imageId: number): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await axiosInstance.get(`/images/${imageId}/comments`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch comments'
      };
    }
  }

  async addComment(imageId: number, content: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await axiosInstance.post(`/images/${imageId}/comments`, { content });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add comment'
      };
    }
  }

  async getImagesByCollection(collectionId: number): Promise<ApiResponse<Image[]>> {
    try {
      const response = await axiosInstance.get(`/collections/${collectionId}/images`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch collection images'
      };
    }
  }

}