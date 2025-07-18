import type { LoginDto, LoginResponseDto } from '../../Domain/DTOs/auth/LoginDto';
import type { RegisterDto } from '../../Domain/DTOs/auth/RegisterDto';

export interface IAuthRepository {
  login(credentials: LoginDto): Promise<{ success: boolean; data?: LoginResponseDto; error?: string }>;
  register(data: RegisterDto): Promise<{ success: boolean; data?: any; error?: string }>;
  getCurrentUser(token: string): Promise<{ success: boolean; data?: any; error?: string }>;
}
