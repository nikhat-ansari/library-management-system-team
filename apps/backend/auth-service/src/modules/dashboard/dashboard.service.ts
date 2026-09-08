import { Injectable } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardDataService: DashboardDataService) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const counts = await this.dashboardDataService.getDashboardCounts();

    return {
      totalBooks: counts.totalBooks,
      totalMembers: counts.totalMembers,
      issuedBooks: counts.issuedBooks,
      overdueBooks: counts.overdueBooks,
      fineSummary: counts.fineSummary,
      reservationSummary: counts.reservationSummary,
      seatUtilization: counts.seatUtilization,
      managementSummary: null,
      trendAlerts: [],
    };
  }
}
