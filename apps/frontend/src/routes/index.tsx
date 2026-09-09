import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AccessDeniedPage } from '../features/auth/access-denied-page';
import { LoginPage } from '../features/auth/login-page';
import { AdminDashboardPage } from '../features/admin/admin-dashboard-page';
import { RoleDashboardPage } from '../features/dashboard/role-dashboard-page';
import { AdminDashboardPage } from '../features/admin/admin-dashboard-page';
import { StaffCreatePage } from '../features/admin-user-management/staff-create-page';
import { StaffDetailsPage } from '../features/admin-user-management/staff-details-page';
import { StaffEditPage } from '../features/admin-user-management/staff-edit-page';
import { StaffListPage } from '../features/admin-user-management/staff-list-page';
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
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
<<<<<<< HEAD
          { path: '/admin/users', element: <StaffListPage /> },
          { path: '/admin/users/new', element: <StaffCreatePage /> },
          { path: '/admin/users/:staffId', element: <StaffDetailsPage /> },
          { path: '/admin/users/:staffId/edit', element: <StaffEditPage /> },
=======
>>>>>>> origin/main
        ],
      },
      {
        element: <ProtectedRoute roles={['LIBRARIAN_STAFF']} />,
        children: [{ path: '/librarian', element: <RoleDashboardPage role="LIBRARIAN_STAFF" /> }],
      },
      {
        element: <ProtectedRoute roles={['MEMBER']} />,
        children: [{ path: '/member', element: <RoleDashboardPage role="MEMBER" /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
