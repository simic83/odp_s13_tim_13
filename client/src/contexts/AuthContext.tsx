import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { LoginDto, LoginResponseDto } from '../Domain/DTOs/auth/LoginDto';
import type { RegisterDto } from '../Domain/DTOs/auth/RegisterDto';
import { AuthRepository } from '../api/repositories/AuthRepository';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (credentials: LoginDto) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterDto) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authRepository = new AuthRepository();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pinterest_token');
      const storedUser = localStorage.getItem('pinterest_user');

      if (token && storedUser) {
        try {
          // Check if token is expired
          const decoded: any = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired
            localStorage.removeItem('pinterest_token');
            localStorage.removeItem('pinterest_user');
          } else {
            // Verify token with server
            const response: { success: boolean; data?: any; error?: string } =
              await authRepository.getCurrentUser(token);
            if (response.success) {
              setUser(response.data);
            } else {
              localStorage.removeItem('pinterest_token');
              localStorage.removeItem('pinterest_user');
            }
          }
        } catch (error) {
          localStorage.removeItem('pinterest_token');
          localStorage.removeItem('pinterest_user');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (
    credentials: LoginDto
  ): Promise<{ success: boolean; error?: string }> => {
    const response: { success: boolean; data?: LoginResponseDto; error?: string } =
      await authRepository.login(credentials);

    if (response.success && response.data) {
      const { token, ...userData } = response.data;
      localStorage.setItem('pinterest_token', token);
      localStorage.setItem('pinterest_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return { success: false, error: response.error || 'Login failed' };
  };

  const register = async (
    data: RegisterDto
  ): Promise<{ success: boolean; error?: string }> => {
    const response: { success: boolean; data?: any; error?: string } =
      await authRepository.register(data);

    if (response.success && response.data) {
      const { token, ...userData } = response.data;
      localStorage.setItem('pinterest_token', token);
      localStorage.setItem('pinterest_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }

    return { success: false, error: response.error || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('pinterest_token');
    localStorage.removeItem('pinterest_user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
