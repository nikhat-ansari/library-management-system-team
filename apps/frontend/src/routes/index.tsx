import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AccessDeniedPage } from '../features/auth/access-denied-page';
import { LoginPage } from '../features/auth/login-page';
import { AdminDashboardPage } from '../features/admin/admin-dashboard-page';
import { StaffPermissionsPage } from '../features/admin-permissions/staff-permissions-page';
import { AdminSystemSettingsPage } from '../features/admin-system-settings/admin-system-settings-page';
import { AdminReportsPage } from '../features/admin-reports/admin-reports-page';
import { AdminAuditLogsPage } from '../features/admin-audit-logs/admin-audit-logs-page';
import { AiSettingsPage } from '../features/admin-system-health/ai-settings-page';
import { SystemHealthPage } from '../features/admin-system-health/system-health-page';
import { RoleDashboardPage } from '../features/dashboard/role-dashboard-page';
import { LibrarianDashboardPage } from '../features/librarian/librarian-dashboard-page';
import { StaffCreatePage } from '../features/admin-user-management/staff-create-page';
import { StaffDetailsPage } from '../features/admin-user-management/staff-details-page';
import { StaffEditPage } from '../features/admin-user-management/staff-edit-page';
import { StaffListPage } from '../features/admin-user-management/staff-list-page';
import { ProtectedRoute, PublicOnlyRoute } from './protected-route';
import { RoleRedirect } from './role-redirect';

import { BookListPage } from '../features/librarian/books/book-list-page';
import { BookCreatePage } from '../features/librarian/books/book-create-page';
import { BookEditPage } from '../features/librarian/books/book-edit-page';
import { BookImportPage } from '../features/librarian/books/book-import-page';
import { BookDetailsPage } from '../features/librarian/books/book-details-page';
import { CirculationPage } from '../features/librarian/circulation/circulation-page';
import { FineManagementPage } from '../features/librarian/fines/fine-management-page';

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
          { path: '/admin/permissions', element: <StaffPermissionsPage /> },
          { path: '/admin/settings', element: <AdminSystemSettingsPage /> },
          { path: '/admin/reports', element: <AdminReportsPage /> },
          { path: '/admin/audit-logs', element: <AdminAuditLogsPage /> },
          { path: '/admin/system-health', element: <SystemHealthPage /> },
          { path: '/admin/ai-settings', element: <AiSettingsPage /> },
          { path: '/admin/users', element: <StaffListPage /> },
          { path: '/admin/users/new', element: <StaffCreatePage /> },
          { path: '/admin/users/:staffId', element: <StaffDetailsPage /> },
          { path: '/admin/users/:staffId/edit', element: <StaffEditPage /> },
        ],
      },
      {
        element: <ProtectedRoute roles={['LIBRARIAN_STAFF']} />,
        children: [
          { path: '/librarian', element: <LibrarianDashboardPage /> },
          { path: '/librarian/books', element: <BookListPage /> },
          { path: '/librarian/books/new', element: <BookCreatePage /> },
          { path: '/librarian/books/import', element: <BookImportPage /> },
          { path: '/librarian/books/:id', element: <BookDetailsPage /> },
          { path: '/librarian/books/:id/edit', element: <BookEditPage /> },
          { path: '/librarian/circulation', element: <CirculationPage /> },
          { path: '/librarian/fines', element: <FineManagementPage /> },
        ],
      },
      {
        element: <ProtectedRoute roles={['MEMBER']} />,
        children: [{ path: '/member', element: <RoleDashboardPage role="MEMBER" /> }],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
