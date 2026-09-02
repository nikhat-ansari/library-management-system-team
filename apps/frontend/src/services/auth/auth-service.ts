import type { AuthResponse, LoginRequest } from '../../types/auth';
import { developmentAuthService } from './development-auth-service';

export interface AuthService {
  login(request: LoginRequest): Promise<AuthResponse>;
}

// Replace this binding with an API-backed AuthService when the authentication API is available.
export const authService: AuthService = developmentAuthService;
