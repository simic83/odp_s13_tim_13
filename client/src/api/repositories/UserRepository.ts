import type { IUserRepository } from '../../Domain/repositories/IUserRepository';
import type { User } from '../../Domain/models/User';
import type { ApiResponse } from '../../Domain/DTOs/ApiResponse';
import axiosInstance from '../axios.config';

export class UserRepository implements IUserRepository {
  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      
      // Check if the response indicates user not found
      if (response.data && response.data.data) {
        const userData = response.data.data;
        
        // Check if the user data is valid (not empty/default user)
        if (userData.id === 0 || !userData.username) {
          return {
            success: false,
            error: 'User not found'
          };
        }
      }
      
      return response.data;
    } catch (error: any) {
      // Handle 404 explicitly
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'User not found'
        };
      }
      
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