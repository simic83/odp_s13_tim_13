import { UserLoginDto } from "../../DTOs/auth/UserLoginDto";
import { UserRegisterDto } from "../../DTOs/auth/UserRegisterDto";

export interface IAuthService {
  login(email: string, password: string): Promise<UserLoginDto>;
  register(data: UserRegisterDto): Promise<UserLoginDto>;
  validateToken(token: string): Promise<any>;
}