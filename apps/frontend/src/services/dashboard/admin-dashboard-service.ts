import { apiClient } from '../../lib/axios';
import type { AdminDashboard } from '../../types/dashboard';

export const adminDashboardService = {
  async getDashboard(): Promise<AdminDashboard> {
    const { data } = await apiClient.get<AdminDashboard>('/admin/dashboard');
    return data;
  },
};
