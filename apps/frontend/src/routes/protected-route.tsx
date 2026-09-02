import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import type { UserRole } from '../types/auth';
import { SessionCheck } from '../components/common/session-check';
import { getDashboardPath } from './role-redirect';

export function ProtectedRoute({ roles }: { roles?: readonly UserRole[] }) {
  const { hasRole, status } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <SessionCheck />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !hasRole(roles)) return <Navigate to="/forbidden" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { status, user } = useAuth();
  if (status === 'checking') return <SessionCheck />;
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return <Outlet />;
}
