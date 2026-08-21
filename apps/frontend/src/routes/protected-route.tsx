import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import type { UserRole } from '../types/auth';

export function ProtectedRoute({ roles }: { roles?: UserRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}
