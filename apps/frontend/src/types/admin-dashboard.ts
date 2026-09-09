export interface FineSummary {
  outstandingAmount: number;
  pendingPayments?: number;
}

export interface ReservationSummary {
  pending: number;
  readyForPickup?: number;
}

export interface SeatUtilization {
  occupied: number;
  total: number;
  percentage?: number;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface AiManagementSummary {
  content: string;
  generatedAt?: string;
}

export interface AdminDashboardResponse {
  totalBooks?: number;
  totalMembers?: number;
  issuedBooks?: number;
  overdueBooks?: number;
  fineSummary?: FineSummary;
  reservationSummary?: ReservationSummary;
  seatUtilization?: SeatUtilization;
  managementSummary?: AiManagementSummary | null;
  trendAlerts?: DashboardAlert[];
}
