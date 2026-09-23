import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { AiAvailabilityService } from '../system-health/ai-availability.service';
import { LibrarianDashboardDataService } from './librarian-dashboard-data.service';
import { type LibrarianDashboardResponse } from './dto/librarian-dashboard-response.dto';
import { LIBRARY_TIME_ZONE, libraryDayRange } from './librarian-dashboard.types';

@Injectable()
export class LibrarianDashboardService {
  private readonly logger = new Logger(LibrarianDashboardService.name);
  constructor(private readonly data: LibrarianDashboardDataService, private readonly aiAvailability: AiAvailabilityService) {}

  async getDashboard(now = new Date()): Promise<LibrarianDashboardResponse> {
    const day = libraryDayRange(now);
    const [operations, dailyPriorityInsight] = await Promise.all([this.data.read(day), this.readInsight()]);
    return { libraryDate: day.date, timeZone: LIBRARY_TIME_ZONE, ...operations, dailyPriorityInsight };
  }

  private async readInsight(): Promise<LibrarianDashboardResponse['dailyPriorityInsight']> {
    try {
      await this.aiAvailability.assertEnabled();
      // The repository has no configured AI provider. Never invent content from dashboard counts.
      return { status: 'not_configured', content: null };
    } catch (error: unknown) {
      if (error instanceof ServiceUnavailableException) {
        const response = error.getResponse();
        const reason = typeof response === 'object' && response !== null && 'reason' in response ? String(response.reason) : 'settings_unavailable';
        const status = reason === 'disabled' ? 'disabled' : 'settings_unavailable';
        this.logger.debug(`Daily-priority AI insight unavailable: ${reason}`);
        return { status, content: null };
      }
      this.logger.warn('Daily-priority AI insight failed; returning core dashboard without insight');
      return { status: 'settings_unavailable', content: null };
    }
  }
}
