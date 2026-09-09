export const USER_ROLES = ['ADMIN', 'LIBRARIAN_STAFF', 'MEMBER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  accessToken: string;
}

export interface CurrentUser extends AuthenticatedUser {
  email: string;
  status: 'active' | 'inactive';
  memberType?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'UNEXPECTED_ERROR';

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}
