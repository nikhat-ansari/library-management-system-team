import { useQuery } from '@tanstack/react-query';
import { adminDashboardService } from '../../services/dashboard/admin-dashboard-service';
import type { AdminDashboard } from '../../types/dashboard';
import { AdminLayout } from './admin-layout';
import { DashboardVisualizations } from './dashboard-visualizations';

type Metric = { title: string; value: string; detail: string };
const number = (value: number) => new Intl.NumberFormat().format(value);
function metrics(data: AdminDashboard): Metric[] {
  const fineSummary = data.fineSummary ?? { outstandingAmount: 0, pendingPayments: 0 };
  const reservationSummary = data.reservationSummary ?? { pending: 0, readyForPickup: 0 };
  const seatUtilization = data.seatUtilization ?? { occupied: 0, total: 0, percentage: 0 };
  return [
    { title: 'Total books', value: number(data.totalBooks), detail: 'Official catalogue total' },
    { title: 'Total members', value: number(data.totalMembers), detail: 'Active and registered members' },
    { title: 'Issued books', value: number(data.issuedBooks), detail: 'Current circulation' },
    { title: 'Overdue books', value: number(data.overdueBooks), detail: 'Requires staff follow-up' },
    { title: 'Outstanding fines', value: `₹${number(fineSummary.outstandingAmount)}`, detail: `${number(fineSummary.pendingPayments)} pending payments` },
    { title: 'Reservations', value: number(reservationSummary.pending), detail: `${number(reservationSummary.readyForPickup)} ready for pickup` },
    { title: 'Seat utilization', value: `${seatUtilization.percentage}%`, detail: `${number(seatUtilization.occupied)} of ${number(seatUtilization.total)} seats in use` },
  ];
}
function MetricCard({ metric, loading }: { metric: Metric; loading?: boolean }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{loading ? <><div className="h-4 w-24 animate-pulse rounded bg-slate-200" /><div className="mt-5 h-8 w-20 animate-pulse rounded bg-slate-200" /><div className="mt-4 h-3 w-36 animate-pulse rounded bg-slate-100" /></> : <><p className="text-sm font-medium text-slate-600">{metric.title}</p><p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{metric.detail}</p></>}</article>;
}
interface DashboardAlert { id: string; title: string; description: string; }
function isDashboardAlert(value: unknown): value is DashboardAlert { return typeof value === 'object' && value !== null && 'id' in value && 'title' in value && 'description' in value && typeof value.id === 'string' && typeof value.title === 'string' && typeof value.description === 'string'; }
function AlertList({ alerts }: { alerts: unknown[] }) {
  const dashboardAlerts = alerts.filter(isDashboardAlert);
  if (!dashboardAlerts.length) return <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No management alerts or trend changes need attention.</div>;
  return <div className="grid gap-3">{dashboardAlerts.map((alert) => <article key={alert.id} className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-900">{alert.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{alert.description}</p></article>)}</div>;
}
export function AdminDashboardPage() {
  const query = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminDashboardService.getDashboard, retry: 1 });
  const data = query.data;
  return <AdminLayout><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-700">Overview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Library at a glance</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Official operational metrics supplied by the library system.</p></div>{query.isError && <button type="button" onClick={() => void query.refetch()} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50">Retry dashboard</button>}</div>{query.isError ? <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5"><h2 className="font-semibold text-red-950">Dashboard data is unavailable</h2><p className="mt-2 text-sm leading-6 text-red-800">We could not load the official dashboard summary. Please try again shortly.</p></section> : <><section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(data ? metrics(data) : Array.from({ length: 7 }, (_, index) => ({ title: String(index), value: '', detail: '' }))).map((metric, index) => <MetricCard key={`${metric.title}-${index}`} metric={metric} loading={query.isLoading} />)}</section><DashboardVisualizations data={data} loading={query.isLoading} /><section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-950">Management summary</p><p className="mt-1 text-sm text-slate-500">AI-assisted insight — not an official record.</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">AI assisted</span></div>{query.isLoading ? <div className="mt-5 h-20 animate-pulse rounded-lg bg-slate-100" /> : data?.managementSummary?.content ? <p className="mt-5 text-sm leading-7 text-slate-700">{data.managementSummary.content}</p> : <div className="mt-5 rounded-lg border border-dashed border-slate-300 px-4 py-7 text-sm text-slate-500">AI summary is currently unavailable. Official metrics remain available above.</div>}</article><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-950">Trends & alerts</p><p className="mt-1 text-sm text-slate-500">Backend-provided management signals.</p><div className="mt-5">{query.isLoading ? <div className="h-28 animate-pulse rounded-lg bg-slate-100" /> : <AlertList alerts={data?.trendAlerts ?? []} />}</div></article></section></>}</AdminLayout>;
}
