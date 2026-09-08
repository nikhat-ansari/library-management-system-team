import type { ReactNode } from 'react';
import type { StaffAccountStatus, StaffRole, StaffUser } from '../../types/admin-user-management';

export const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, {
  day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(value));

export function StaffRoleBadge({ role }: { role: StaffRole }) {
  return <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">{role === 'LIBRARIAN_STAFF' ? 'Librarian / Staff' : role}</span>;
}

export function StaffStatusBadge({ status }: { status: StaffAccountStatus }) {
  const active = status === 'active';
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${active ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-600' : 'bg-slate-400'}`} />{active ? 'Active' : 'Inactive'}</span>;
}

export function StaffPageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Administration</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>{action && <div className="shrink-0">{action}</div>}</div>;
}

export function StaffIdentity({ staff }: { staff: StaffUser }) {
  const initials = staff.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-100">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{staff.name}</p><p className="mt-0.5 truncate text-sm text-slate-500">{staff.email}</p></div></div>;
}
