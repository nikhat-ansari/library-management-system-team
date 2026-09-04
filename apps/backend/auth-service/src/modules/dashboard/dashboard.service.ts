import { Injectable } from '@nestjs/common';
import { DashboardDataService } from './dashboard-data.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardDataService: DashboardDataService) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const { totalBooks, totalMembers, unavailableDependencies } = await this.dashboardDataService.getDashboardCounts();

    return {
      totalBooks,
      totalMembers,
      issuedBooks: null,
      overdueBooks: null,
      fineSummary: null,
      reservationSummary: null,
      seatUtilization: null,
      managementSummary: null,
      trendAlerts: [],
      unavailableDependencies: [
        ...unavailableDependencies,
        'circulation collection and due-date rules',
        'fine collection and payment rules',
        'reservation collection and status rules',
        'seat and seat-booking collections',
        'AI management-summary and trend-alert provider',
      ],
    };
  }
}
