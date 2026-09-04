import type { AdminDashboardResponse } from '../types/admin-dashboard';

// Development-only visual fixture. Enable only with VITE_USE_ADMIN_DASHBOARD_MOCK=true.
const developmentDashboardMock: AdminDashboardResponse = {
  totalBooks: 12486,
  totalMembers: 3864,
  issuedBooks: 928,
  overdueBooks: 37,
  fineSummary: { outstandingAmount: 12450, pendingPayments: 83 },
  reservationSummary: { pending: 64, readyForPickup: 12 },
  seatUtilization: { occupied: 72, total: 96, percentage: 75 },
  managementSummary: {
    content: 'Circulation remains steady this week. Overdue activity is concentrated in a small group of accounts, while study-seat demand is highest between 2 PM and 6 PM.',
    generatedAt: '2026-09-02T09:00:00.000Z',
  },
  trendAlerts: [
    { id: 'overdue-follow-up', title: 'Overdue follow-up needed', description: '37 issued books are overdue and should be reviewed by circulation staff.', severity: 'warning' },
    { id: 'seat-demand', title: 'Peak seat demand', description: 'Seat utilization is at 75%; afternoon capacity should be monitored.', severity: 'info' },
  ],
};

export async function getDevelopmentAdminDashboardMock(): Promise<AdminDashboardResponse> {
  await new Promise<void>((resolve) => window.setTimeout(resolve, 350));
  return developmentDashboardMock;
}
