import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import type { UserRole } from '../types/auth';

export const dashboardPathByRole: Record<UserRole, string> = {
  ADMIN: '/admin',
  LIBRARIAN_STAFF: '/librarian',
  MEMBER: '/member',
};

export function getDashboardPath(role: UserRole): string {
  return dashboardPathByRole[role];
}

export function RoleRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Navigate to="/login" replace />;
}
