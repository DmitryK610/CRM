import type { User } from '@/types/user';
import { api } from '@/utils/api'; // Импортируйте ваш объект api


interface LoginRequest {
  username: string;
  password: string;
}

interface AuthLoginResponse {
  token?: string;
  user?: User;
}

export async function login(credentials: LoginRequest): Promise<AuthLoginResponse> {
  try {
    const response = await api.post<LoginRequest, LoginResponse>('/api/login/', credentials);
    if (!response) {
      throw new Error('Login response is null');
    }
    return response;
  } catch (error: any) {
    console.error('Ошибка при запросе на вход:', error);
    throw error;
  }
}

export interface LoginResponse {
  token?: string;
  user?: User;
}
