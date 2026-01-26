import { authClient } from '@/lib/api';
import {
  AuthResponse,
  RegisterData,
  LoginData,
  User,
  UpdateProfileData,
} from '@/types/user.types';
import Cookies from 'js-cookie';

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await authClient.post<AuthResponse>('/auth/register', data);
    if (response.data.data.accessToken) {
      Cookies.set('accessToken', response.data.data.accessToken, { expires: 7 });
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await authClient.post<AuthResponse>('/auth/login', data);
    if (response.data.data.accessToken) {
      Cookies.set('accessToken', response.data.data.accessToken, { expires: 7 });
    }
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await authClient.get<{ message: string; data: User }>('/auth/profile');
    return response.data.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await authClient.put<{ message: string; data: User }>('/auth/profile', data);
    return response.data.data;
  }

  async deleteAccount(): Promise<void> {
    await authClient.delete('/auth/account');
    this.logout();
  }

  logout(): void {
    Cookies.remove('accessToken');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  getToken(): string | undefined {
    return Cookies.get('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
