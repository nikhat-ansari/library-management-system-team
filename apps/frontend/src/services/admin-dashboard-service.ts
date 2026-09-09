import { apiClient } from '../lib/axios';
import type { AdminDashboardResponse } from '../types/admin-dashboard';

export const adminDashboardService = {
  async getDashboard(): Promise<AdminDashboardResponse> {
    const { data } = await apiClient.get<AdminDashboardResponse>('/admin/dashboard');
    return data;
  },
};
