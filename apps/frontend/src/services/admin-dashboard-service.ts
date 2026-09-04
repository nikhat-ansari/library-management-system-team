import { apiClient } from '../lib/axios';
import { env } from '../config/env';
import type { AdminDashboardResponse } from '../types/admin-dashboard';
import { getDevelopmentAdminDashboardMock } from './admin-dashboard-development-mock';

export const adminDashboardService = {
  async getDashboard(): Promise<AdminDashboardResponse> {
    if (env.useAdminDashboardMock) return getDevelopmentAdminDashboardMock();
    const { data } = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
    return data;
  },
};
