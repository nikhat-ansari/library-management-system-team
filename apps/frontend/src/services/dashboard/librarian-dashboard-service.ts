import { apiClient } from '../../lib/axios';
import type { LibrarianDashboardResponse } from '../../types/librarian-dashboard';

export const librarianDashboardService = {
  async getDashboard(): Promise<LibrarianDashboardResponse> {
    const { data } = await apiClient.get<LibrarianDashboardResponse>('/librarian/dashboard');
    return data;
  },
};
