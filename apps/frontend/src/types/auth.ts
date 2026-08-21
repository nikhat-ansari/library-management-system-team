export type UserRole = 'ADMIN' | 'STAFF' | 'MEMBER';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}
