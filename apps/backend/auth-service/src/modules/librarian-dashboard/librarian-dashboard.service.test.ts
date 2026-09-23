import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ServiceUnavailableException } from '@nestjs/common';
import { LibrarianDashboardService } from './librarian-dashboard.service';
import { libraryDayRange } from './librarian-dashboard.types';
import type { LibrarianDashboardResponse } from './dto/librarian-dashboard-response.dto';

const operationalData: Pick<LibrarianDashboardResponse, 'dueToday' | 'overdue' | 'pendingReservations' | 'seatBookings'> = {
  dueToday: { count: 1, loans: [], hasMore: false },
  overdue: { count: 2, loans: [], hasMore: false },
  pendingReservations: { count: 3, reservations: [], hasMore: false },
  seatBookings: { count: 4, bookings: [], hasMore: false },
};

describe('Module 9 librarian dashboard service', () => {
  it('uses Asia/Kolkata calendar-day boundaries across a UTC date boundary', () => {
    const range = libraryDayRange(new Date('2026-09-21T18:31:00.000Z'));
    assert.equal(range.date, '2026-09-22');
    assert.equal(range.startsAt.toISOString(), '2026-09-21T18:30:00.000Z');
    assert.equal(range.endsAt.toISOString(), '2026-09-22T18:30:00.000Z');
  });

  it('returns official operational data when AI is disabled', async () => {
    let requestedDate = '';
    const service = new LibrarianDashboardService(
      { read: async (day: { date: string }) => { requestedDate = day.date; return operationalData; } } as never,
      { assertEnabled: async () => { throw new ServiceUnavailableException({ available: false, reason: 'disabled' }); } } as never,
    );
    const result = await service.getDashboard(new Date('2026-09-21T18:31:00.000Z'));
    assert.equal(requestedDate, '2026-09-22');
    assert.equal(result.timeZone, 'Asia/Kolkata');
    assert.equal(result.dueToday.count, 1);
    assert.deepEqual(result.dailyPriorityInsight, { status: 'disabled', content: null });
  });

  it('reports no fabricated insight when AI settings are enabled but no provider is configured', async () => {
    const service = new LibrarianDashboardService(
      { read: async () => operationalData } as never,
      { assertEnabled: async () => undefined } as never,
    );
    const result = await service.getDashboard(new Date('2026-09-21T00:00:00.000Z'));
    assert.deepEqual(result.dailyPriorityInsight, { status: 'not_configured', content: null });
  });
});
