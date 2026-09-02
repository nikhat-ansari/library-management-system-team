import axios from 'axios';
import { apiClient } from '../../lib/axios';
import { AuthError, type CurrentUser, type LoginResponse, type LoginRequest } from '../../types/auth';

export interface AuthService {
  login(request: LoginRequest): Promise<LoginResponse>;
  getCurrentUser(): Promise<CurrentUser>;
  logout(): Promise<void>;
}

function toAuthError(error: unknown): AuthError {
  if (!axios.isAxiosError(error) || !error.response) return new AuthError('NETWORK_ERROR');
  if (error.response.status === 400 || error.response.status === 401) return new AuthError('INVALID_CREDENTIALS');
  if (error.response.status >= 500) return new AuthError('SERVER_ERROR');
  return new AuthError('UNEXPECTED_ERROR');
}

export const authService: AuthService = {
  async login(request) {
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', request);
      return data;
    } catch (error) {
      throw toAuthError(error);
    }
  },

  async getCurrentUser() {
    const { data } = await apiClient.get<CurrentUser>('/users/me');
    return data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};
