export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  id: number;
  username: string;
  email: string;
  token: string;
}