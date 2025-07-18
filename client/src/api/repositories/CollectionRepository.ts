import type { ICollectionRepository } from '../../Domain/repositories/ICollectionRepository';
import type { Collection } from '../../Domain/models/Collection';
import type { ApiResponse, PaginatedResponse } from '../../Domain/DTOs/ApiResponse';
import axiosInstance from '../axios.config';

export class CollectionRepository implements ICollectionRepository {
  async getCollections(page: number, pageSize: number, userId?: number): Promise<ApiResponse<PaginatedResponse<Collection>>> {
    try {
      const params: any = { page, pageSize };
      if (userId) params.userId = userId;
      
      const response = await axiosInstance.get('/collections', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch collections'
      };
    }
  }

  async getUserCollections(userId: number): Promise<ApiResponse<Collection[]>> {
    try {
      const response = await axiosInstance.get(`/collections/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user collections'
      };
    }
  }

  async getCollectionById(id: number): Promise<ApiResponse<Collection>> {
    try {
      const response = await axiosInstance.get(`/collections/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch collection'
      };
    }
  }

  async createCollection(data: any): Promise<ApiResponse<Collection>> {
    try {
      const response = await axiosInstance.post('/collections', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create collection'
      };
    }
  }

  async updateCollection(id: number, data: any): Promise<ApiResponse<Collection>> {
    try {
      const response = await axiosInstance.put(`/collections/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update collection'
      };
    }
  }

  async deleteCollection(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/collections/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete collection'
      };
    }
  }
}