import { useQuery } from '@tanstack/react-query';
import { librarianDashboardService } from '../../services/dashboard/librarian-dashboard-service';
import { LibrarianLayout } from './librarian-layout';
import type { LibrarianDashboardResponse } from '../../types/librarian-dashboard';

type ReservationRow = LibrarianDashboardResponse['pendingReservations']['reservations'][number];
type SeatBookingRow = LibrarianDashboardResponse['seatBookings']['bookings'][number];

function MetricCard({ title, value, detail, loading }: { title: string; value: string | number; detail: string; loading: boolean }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="mt-5 h-8 w-20 rounded bg-gray-100" />
          <div className="mt-4 h-3 w-36 rounded bg-gray-100" />
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
          <p className="mt-2 text-xs leading-5 text-gray-500">{detail}</p>
        </>
      )}
    </article>
  );
}

function SectionList<T>({ title, items, loading, renderItem, emptyText }: { title: string; items: T[]; loading: boolean; renderItem: (item: T, index: number) => React.ReactNode; emptyText: string }) {
  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 px-5 py-4 bg-gray-50/50">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-5 space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-full rounded bg-gray-100" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {items.map((item, index) => renderItem(item, index))}
          </ul>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            {emptyText}
          </div>
        )}
      </div>
    </article>
  );
}

export function LibrarianDashboardPage() {
  const query = useQuery({
    queryKey: ['librarian-dashboard'],
    queryFn: librarianDashboardService.getDashboard,
    retry: 1,
  });
  const data = query.data;

  return (
    <LibrarianLayout>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            Today's Operations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            {data ? `Data as of ${data.libraryDate} (${data.timeZone})` : 'Loading dashboard data...'}
          </p>
        </div>
        {query.isError && (
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="min-h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Retry dashboard
          </button>
        )}
      </div>

      {query.isError ? (
        <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <h2 className="font-semibold text-red-800">Dashboard data is unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-red-700">
            We could not load the operational dashboard summary. Please try again shortly.
          </p>
        </section>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Top Row: KPIs and AI Insight */}
          <div className="grid gap-6 lg:col-span-2 sm:grid-cols-2">
            <MetricCard
              title="Due Today"
              value={data?.dueToday.count ?? 0}
              detail={data?.dueToday.hasMore ? 'More than 50 books due' : 'All loans due today'}
              loading={query.isLoading}
            />
            <MetricCard
              title="Overdue Books"
              value={data?.overdue.count ?? 0}
              detail="Requires follow-up"
              loading={query.isLoading}
            />
          </div>

          <article className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-5 shadow-sm lg:col-span-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-16 -mt-16" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-indigo-950">Daily Priority Insight</p>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                  AI assisted
                </span>
              </div>
              {query.isLoading ? (
                <div className="mt-4 h-24 w-full animate-pulse rounded bg-indigo-100/50" />
              ) : data?.dailyPriorityInsight?.status === 'not_configured' || data?.dailyPriorityInsight?.status === 'disabled' || !data?.dailyPriorityInsight?.content ? (
                <div className="mt-4 flex-1 flex items-center justify-center rounded-lg border border-dashed border-indigo-200 px-4 py-6 text-center text-sm text-indigo-400/80">
                  AI insight is currently unavailable.
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-indigo-900/80">
                  {data.dailyPriorityInsight.content}
                </p>
              )}
            </div>
          </article>

          {/* Bottom Row: Lists */}
          <div className="grid gap-6 lg:col-span-3 lg:grid-cols-2 lg:h-[400px]">
            <SectionList
              title="Pending Reservations"
              items={data?.pendingReservations.reservations ?? []}
              loading={query.isLoading}
              emptyText="No pending reservations at this time."
              renderItem={(res: ReservationRow) => (
                <li key={res.id} className="flex justify-between gap-x-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-6 text-gray-900 truncate">{res.bookTitle ?? 'Unknown Book'}</p>
                    <p className="mt-1 flex text-xs leading-5 text-gray-500">
                      Member ID: {res.memberId}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    <p className="text-sm leading-6 text-gray-500">Queue: <span className="font-medium text-gray-700">{res.queuePosition ?? 'N/A'}</span></p>
                  </div>
                </li>
              )}
            />

            <SectionList
              title="Today's Seat Bookings"
              items={data?.seatBookings.bookings ?? []}
              loading={query.isLoading}
              emptyText="No seat bookings for today."
              renderItem={(booking: SeatBookingRow) => (
                <li key={booking.id} className="flex justify-between gap-x-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-6 text-gray-900">
                      Seat {booking.seatNumber ?? 'N/A'} <span className="text-gray-500 text-xs ml-1 font-normal">({booking.seatType ?? 'Unknown'})</span>
                    </p>
                    <p className="mt-1 flex text-xs leading-5 text-gray-500">
                      Member ID: {booking.memberId}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end">
                    <p className="text-sm leading-6 text-gray-500">
                      {new Date(booking.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{booking.status}</p>
                  </div>
                </li>
              )}
            />
          </div>
        </div>
      )}
    </LibrarianLayout>
  );
}
