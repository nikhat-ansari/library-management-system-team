export const USER_ROLES = ['ADMIN', 'LIBRARIAN_STAFF', 'MEMBER'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE', 'BLOCKED'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  accessToken: string;
}

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE' | 'NETWORK_ERROR' | 'UNEXPECTED_ERROR';

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}
