import type { IUserRepository } from '../../Domain/repositories/IUserRepository';
import type { User } from '../../Domain/models/User';
import type { ApiResponse } from '../../Domain/DTOs/ApiResponse';
import axiosInstance from '../axios.config';

export class UserRepository implements IUserRepository {
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user'
      };
    }
  }

  async updateUser(id: number, data: any): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.put(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user'
      };
    }
  }
}