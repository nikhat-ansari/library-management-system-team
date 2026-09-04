export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  useAdminDashboardMock: import.meta.env.VITE_USE_ADMIN_DASHBOARD_MOCK === 'true',
  // Development-only and opt-in. Production builds always use the API.
  useAdminUsersMock:
    import.meta.env.DEV && import.meta.env.VITE_USE_ADMIN_USERS_MOCK === 'true',
  adminUsersMockScenario: import.meta.env.VITE_ADMIN_USERS_MOCK_SCENARIO ?? 'standard',
};
