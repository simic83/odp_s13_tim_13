import type { IAuthRepository } from '../../Domain/repositories/IAuthRepository';
import type { LoginDto, LoginResponseDto } from '../../Domain/DTOs/auth/LoginDto';
import type { RegisterDto } from '../../Domain/DTOs/auth/RegisterDto';
import type { ApiResponse } from '../../Domain/DTOs/ApiResponse';
import axiosInstance from '../axios.config';

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  async register(data: RegisterDto): Promise<ApiResponse<LoginResponseDto>> {
    try {
      const response = await axiosInstance.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  async getCurrentUser(token: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get user'
      };
    }
  }
}