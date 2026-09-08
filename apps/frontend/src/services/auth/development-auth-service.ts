import { AuthError, type LoginResponse, type LoginRequest, type UserRole } from '../../types/auth';

interface DevelopmentUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Deprecated development fixture. It is intentionally not used by the application runtime.
const developmentUsers: readonly DevelopmentUser[] = [
  { id: 'dev-admin-001', name: 'Avery Admin', email: 'admin@library.test', password: 'DevPassword123!', role: 'ADMIN' },
  { id: 'dev-librarian-001', name: 'Logan Librarian', email: 'librarian@library.test', password: 'DevPassword123!', role: 'LIBRARIAN_STAFF' },
  { id: 'dev-member-001', name: 'Morgan Member', email: 'member@library.test', password: 'DevPassword123!', role: 'MEMBER' },
];

const simulatedRequestDelayMs = 350;

export const developmentAuthService = {
  async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, simulatedRequestDelayMs));
    const user = developmentUsers.find((candidate) => candidate.email === email && candidate.password === password);

    if (!user) throw new AuthError('INVALID_CREDENTIALS');
    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      accessToken: `development-token-${user.id}`,
    };
  },
};
