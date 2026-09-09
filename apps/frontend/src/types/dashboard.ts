export interface FineSummary {
  outstandingAmount: number;
  pendingPayments: number;
}

export interface ReservationSummary {
  pending: number;
  readyForPickup: number;
}

export interface SeatUtilization {
  occupied: number;
  total: number;
  percentage: number;
}

export interface ManagementSummary {
  content: string;
  generatedAt?: string;
}

export interface AdminDashboard {
  totalBooks: number;
  totalMembers: number;
  issuedBooks: number;
  overdueBooks: number;
  fineSummary: FineSummary;
  reservationSummary: ReservationSummary;
  seatUtilization: SeatUtilization;
  managementSummary: ManagementSummary | null;
  trendAlerts: unknown[];
}
