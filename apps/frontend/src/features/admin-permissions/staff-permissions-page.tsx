import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { operationalPermissionGroups } from '../../config/operational-permissions';
import { adminPermissionsService } from '../../services/admin-permissions-service';
import { adminUserManagementService } from '../../services/admin-user-management-service';
import type { OperationalPermission, OperationalPermissionCode } from '../../types/admin-permissions';
import type { StaffUser } from '../../types/admin-user-management';
import { AdminLayout } from '../admin/admin-layout';
import { StaffIdentity, StaffPageHeader, StaffStatusBadge } from '../admin-user-management/staff-ui';

const samePermissions = (left: readonly string[], right: readonly string[]) => {
  if (left.length !== right.length) return false;
  return [...left].sort().every((permission, index) => permission === [...right].sort()[index]);
};

function safeError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return 'Network connection is unavailable. Please try again.';
  if ([401, 403].includes(error.response?.status ?? 0)) return 'You do not have permission to perform this action.';
  if ([400, 422].includes(error.response?.status ?? 0)) return 'The permission changes could not be validated. Please review and try again.';
  return fallback;
}

function StaffSelector({ staff, value, loading, onChange }: { staff: StaffUser[]; value: string; loading: boolean; onChange: (id: string) => void }) {
  return <section className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><label htmlFor="permission-staff" className="block text-sm font-semibold text-slate-950">Staff member</label><p className="mt-1 text-sm text-slate-500">Choose a Librarian / Staff account to review its operational access.</p>{loading ? <div className="mt-4 h-11 animate-pulse rounded-lg bg-slate-100" /> : <select id="permission-staff" value={value} onChange={(event) => onChange(event.target.value)} className="mt-4 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-700 focus:ring-2 focus:ring-indigo-100"><option value="">Select a staff member</option>{staff.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email}) - {user.accountStatus === 'active' ? 'Active' : 'Inactive'}</option>)}</select>}</section>;
}

function PermissionToggle({ permission, allowed, disabled, onChange }: { permission: OperationalPermission; allowed: boolean; disabled: boolean; onChange: () => void }) {
  return <div className="flex flex-col gap-3 border-t border-slate-100 py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{permission.name}</p><p className="mt-1 text-sm leading-6 text-slate-600">{permission.description}</p></div><button type="button" role="switch" aria-checked={allowed} aria-label={`${permission.name}: ${allowed ? 'Allowed' : 'Denied'}`} disabled={disabled} onClick={onChange} className={`inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full border px-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center ${allowed ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-slate-50 text-slate-700'}`}><span className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs ${allowed ? 'bg-emerald-700 text-white' : 'bg-slate-400 text-white'}`}>{allowed ? 'On' : 'Off'}</span><span className="pr-1.5">{allowed ? 'Allowed' : 'Denied'}</span></button></div>;
}

function PermissionSkeleton() {
  return <div className="mt-7 grid gap-5 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <section key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="h-5 w-40 animate-pulse rounded bg-slate-200" /><div className="mt-5 h-16 animate-pulse rounded bg-slate-100" /></section>)}</div>;
}

export function StaffPermissionsPage() {
  const queryClient = useQueryClient();
  const [staffId, setStaffId] = useState('');
  const [draft, setDraft] = useState<OperationalPermissionCode[]>([]);
  const [saved, setSaved] = useState(false);
  const staffQuery = useQuery({ queryKey: ['admin-users'], queryFn: adminUserManagementService.getStaff, retry: 1 });
  const definitionsQuery = useQuery({ queryKey: ['admin', 'permissions'], queryFn: adminPermissionsService.getAvailablePermissions, retry: 1 });
  const permissionsQuery = useQuery({ queryKey: ['admin', 'permissions', staffId], queryFn: () => adminPermissionsService.getStaffPermissions(staffId), enabled: Boolean(staffId), retry: 1 });
  const selectedStaff = staffQuery.data?.find((staff) => staff.id === staffId);
  const originalPermissions = permissionsQuery.data?.permissions ?? [];

  useEffect(() => {
    if (permissionsQuery.data) {
      setDraft(permissionsQuery.data.permissions);
      setSaved(false);
    }
  }, [permissionsQuery.data]);

  const groupedPermissions = useMemo(() => {
    const definitions = new Map((definitionsQuery.data ?? []).map((permission) => [permission.code, permission]));
    return operationalPermissionGroups.map((group) => ({ title: group.title, permissions: group.codes.map((code) => definitions.get(code)).filter((permission): permission is OperationalPermission => Boolean(permission)) })).filter((group) => group.permissions.length > 0);
  }, [definitionsQuery.data]);

  const saveMutation = useMutation({ mutationFn: () => adminPermissionsService.updateStaffPermissions(staffId, draft), onSuccess: (result) => { queryClient.setQueryData(['admin', 'permissions', staffId], result); setDraft(result.permissions); setSaved(true); } });
  const toggle = (code: OperationalPermissionCode) => { setSaved(false); setDraft((current) => current.includes(code) ? current.filter((permission) => permission !== code) : [...current, code]); };
  const selectStaff = (id: string) => { setStaffId(id); setDraft([]); setSaved(false); };
  const dirty = permissionsQuery.isSuccess && !samePermissions(draft, originalPermissions);
  const saveDisabled = !staffId || !permissionsQuery.isSuccess || !dirty || saveMutation.isPending;

  let content: React.ReactNode;
  if (staffQuery.isError) content = <Message tone="error" text="Staff accounts could not be loaded." retry={() => void staffQuery.refetch()} />;
  else if (!staffQuery.isLoading && !staffQuery.data?.length) content = <Message text="No staff accounts are available." />;
  else if (!staffId) content = <Message text="Select a staff member to manage permissions." />;
  else if (permissionsQuery.isLoading || definitionsQuery.isLoading) content = <PermissionSkeleton />;
  else if (permissionsQuery.isError) content = <Message tone="error" text={safeError(permissionsQuery.error, 'Permissions could not be loaded. Please try again.')} retry={() => void permissionsQuery.refetch()} />;
  else if (definitionsQuery.isError) content = <Message tone="error" text={safeError(definitionsQuery.error, 'Permissions could not be loaded. Please try again.')} retry={() => void definitionsQuery.refetch()} />;
  else if (!groupedPermissions.length) content = <Message text="Operational permissions are not currently available." />;
  else content = <><section className="mt-7 grid gap-5 lg:grid-cols-2">{groupedPermissions.map((group) => <section key={group.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-950">{group.title}</h2><div className="mt-4">{group.permissions.map((permission) => <PermissionToggle key={permission.code} permission={permission} allowed={draft.includes(permission.code)} disabled={saveMutation.isPending} onChange={() => toggle(permission.code)} />)}</div></section>)}</section><section className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div>{saved && <p role="status" className="text-sm font-medium text-emerald-800">Permissions updated successfully.</p>}{saveMutation.isError && <p role="alert" className="text-sm font-medium text-red-800">{safeError(saveMutation.error, 'Permissions could not be updated. Please try again.')}</p>}{!saved && !saveMutation.isError && <p className="text-sm text-slate-600">Changes are saved only when you select Save Permissions.</p>}</div><button type="button" disabled={saveDisabled} onClick={() => void saveMutation.mutateAsync()} className="min-h-11 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">{saveMutation.isPending ? 'Saving permissions...' : 'Save Permissions'}</button></section></>;

  return <AdminLayout><StaffPageHeader title="Staff Permissions" description="Manage operational access for Librarian and Staff accounts." /><StaffSelector staff={staffQuery.data ?? []} value={staffId} loading={staffQuery.isLoading} onChange={selectStaff} />{staffId && <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><p className="text-sm font-semibold text-slate-950">Selected staff</p>{selectedStaff ? <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><StaffIdentity staff={selectedStaff} /><StaffStatusBadge status={selectedStaff.accountStatus} /></div> : <p className="mt-3 text-sm text-slate-600">Selected staff details are unavailable.</p>}</section>}{content}</AdminLayout>;
}

function Message({ text, tone = 'empty', retry }: { text: string; tone?: 'empty' | 'error'; retry?: () => void }) {
  return <section className={`mt-5 rounded-xl p-5 ${tone === 'error' ? 'border border-red-200 bg-red-50 text-red-950' : 'border border-dashed border-slate-300 bg-white text-slate-600'} ${tone === 'empty' ? 'px-5 py-12 text-center text-sm' : ''}`}><p className={tone === 'error' ? 'font-semibold' : undefined}>{text}</p>{retry && <button type="button" onClick={retry} className="mt-3 text-sm font-semibold underline">Retry</button>}</section>;
}
