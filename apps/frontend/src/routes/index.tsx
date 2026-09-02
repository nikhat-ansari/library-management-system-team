import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AccessDeniedPage } from '../features/auth/access-denied-page';
import { LoginPage } from '../features/auth/login-page';
import { RoleDashboardPage } from '../features/dashboard/role-dashboard-page';
import { ProtectedRoute, PublicOnlyRoute } from './protected-route';
import { RoleRedirect } from './role-redirect';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <RoleRedirect /> },
      { path: '/forbidden', element: <AccessDeniedPage /> },
      {
        element: <ProtectedRoute roles={['ADMIN']} />,
        children: [{ path: '/admin', element: <RoleDashboardPage role="ADMIN" /> }],
      },
      {
        element: <ProtectedRoute roles={['STAFF']} />,
        children: [{ path: '/librarian', element: <RoleDashboardPage role="STAFF" /> }],
      },
      {
        element: <ProtectedRoute roles={['MEMBER']} />,
        children: [{ path: '/member', element: <RoleDashboardPage role="MEMBER" /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
