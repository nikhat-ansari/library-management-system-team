import type { AdminDashboard } from '../../types/dashboard';

const format = (value: number) => new Intl.NumberFormat().format(value);

export function DashboardVisualizations({ data, loading }: { data?: AdminDashboard; loading: boolean }) {
  if (loading) return <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="h-60 animate-pulse rounded-xl bg-slate-200" /><div className="h-60 animate-pulse rounded-xl bg-slate-200" /></section>;
  const seat = data?.seatUtilization;
  const issued = data?.issuedBooks ?? 0;
  const overdue = data?.overdueBooks ?? 0;
  const percentage = seat?.percentage ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const circulationMaximum = Math.max(issued, overdue, 1);
  return <section className="mt-6 grid gap-6 lg:grid-cols-2"><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-950">Seat utilization</h2><p className="mt-1 text-sm text-slate-500">Current use of available study seats.</p>{seat ? <div className="mt-5 flex items-center gap-5"><svg viewBox="0 0 112 112" className="h-28 w-28 shrink-0" role="img" aria-label={`${percentage}% of seats are in use`}><title>Seat utilization</title><circle cx="56" cy="56" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" /><circle cx="56" cy="56" r={radius} fill="none" stroke="#4f46e5" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - percentage / 100)} transform="rotate(-90 56 56)" /><text x="56" y="53" textAnchor="middle" className="fill-slate-950 text-[22px] font-semibold">{percentage}%</text><text x="56" y="72" textAnchor="middle" className="fill-slate-500 text-[10px]">in use</text></svg><div><p className="text-2xl font-semibold tracking-tight text-slate-950">{format(seat.occupied)} <span className="text-base font-medium text-slate-500">/ {format(seat.total)}</span></p><p className="mt-2 text-sm leading-6 text-slate-600">Official current seat availability.</p></div></div> : <div className="mt-5 rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">Seat utilization data is not available.</div>}</article><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold text-slate-950">Circulation overview</h2><p className="mt-1 text-sm text-slate-500">Current issued and overdue book counts.</p>{data ? <div className="mt-6 space-y-5" role="img" aria-label={`Issued books: ${issued}; overdue books: ${overdue}`}><CirculationBar label="Issued books" value={issued} maximum={circulationMaximum} color="bg-indigo-600" /><CirculationBar label="Overdue books" value={overdue} maximum={circulationMaximum} color="bg-amber-500" /></div> : <div className="mt-5 rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">Circulation data is not available.</div>}</article></section>;
}

function CirculationBar({ label, value, maximum, color }: { label: string; value: number; maximum: number; color: string }) {
  return <div><div className="flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-700">{label}</span><span className="font-semibold tabular-nums text-slate-950">{format(value)}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${(value / maximum) * 100}%` }} /></div></div>;
}
