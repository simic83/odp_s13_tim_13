import { User } from '../models/User';
import type { ApiResponse } from '../DTOs/ApiResponse';

export interface IUserRepository {
  getUserById(id: number): Promise<ApiResponse<User>>;
  updateUser(id: number, data: any): Promise<ApiResponse<User>>;
}