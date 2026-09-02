import { AuthError, type AuthResponse, type LoginRequest, type UserRole } from '../../types/auth';
import type { AuthService } from './auth-service';

interface DevelopmentUser {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  accountStatus: 'ACTIVE' | 'INACTIVE';
}

// TEMPORARY DEVELOPMENT ONLY. Remove this data when the real authentication API is connected.
const developmentUsers: readonly DevelopmentUser[] = [
  { userId: 'dev-admin-001', name: 'Avery Admin', email: 'admin@library.test', password: 'DevPassword123!', role: 'ADMIN', accountStatus: 'ACTIVE' },
  { userId: 'dev-librarian-001', name: 'Logan Librarian', email: 'librarian@library.test', password: 'DevPassword123!', role: 'LIBRARIAN_STAFF', accountStatus: 'ACTIVE' },
  { userId: 'dev-member-001', name: 'Morgan Member', email: 'member@library.test', password: 'DevPassword123!', role: 'MEMBER', accountStatus: 'ACTIVE' },
  { userId: 'dev-inactive-001', name: 'Inactive Member', email: 'inactive@library.test', password: 'DevPassword123!', role: 'MEMBER', accountStatus: 'INACTIVE' },
];

const simulatedRequestDelayMs = 350;

export const developmentAuthService: AuthService = {
  async login({ email, password }: LoginRequest): Promise<AuthResponse> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, simulatedRequestDelayMs));
    const user = developmentUsers.find((candidate) => candidate.email === email && candidate.password === password);

    if (!user) throw new AuthError('INVALID_CREDENTIALS');
    if (user.accountStatus !== 'ACTIVE') throw new AuthError('ACCOUNT_INACTIVE');

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
      accessToken: `development-token-${user.userId}`,
    };
  },
};
