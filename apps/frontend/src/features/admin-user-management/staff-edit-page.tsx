import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminUserManagementService, toStaffApiError } from '../../services/admin-user-management-service';
import type { StaffApiError } from '../../types/admin-user-management';
import { AdminLayout } from '../admin/admin-layout';
import { StaffForm, type StaffFormValues } from './staff-form';
import { StaffPageHeader } from './staff-ui';

function PageMessage({ title, detail }: { title: string; detail: string }) { return <div className="mt-7 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-5"><h2 className="font-semibold text-red-950">{title}</h2><p className="mt-2 text-sm leading-6 text-red-800">{detail}</p><Link to="/admin/users" className="mt-4 inline-block text-sm font-semibold text-red-900 underline">Return to staff accounts</Link></div>; }
export function StaffEditPage() {
  const { staffId = '' } = useParams(); const navigate = useNavigate(); const queryClient = useQueryClient(); const [serverError, setServerError] = useState<StaffApiError>();
  const query = useQuery({ queryKey: ['admin-user', staffId], queryFn: () => adminUserManagementService.getStaffById(staffId), enabled: Boolean(staffId), retry: 1 });
  const mutation = useMutation({ mutationFn: (values: StaffFormValues) => adminUserManagementService.updateStaff(staffId, values), onSuccess: async (staff) => { await queryClient.invalidateQueries({ queryKey: ['admin-users'] }); await queryClient.invalidateQueries({ queryKey: ['admin-user', staffId] }); navigate(`/admin/users/${staff.id}`, { replace: true, state: { notice: `${staff.name}'s account information was updated.` } }); }, onError: (error) => setServerError(toStaffApiError(error, 'Staff account could not be updated. Please try again.')) });
  const submit = async (values: StaffFormValues) => { setServerError(undefined); await mutation.mutateAsync(values); };
  return <AdminLayout><StaffPageHeader title="Edit staff account" description="Update the staff member's name or work email. Role and account access are managed separately." action={<Link to={`/admin/users/${staffId}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">Back to staff details</Link>} />{query.isLoading ? <div className="mt-7 h-96 max-w-2xl animate-pulse rounded-xl bg-slate-200" /> : query.isError || !query.data ? <PageMessage title={query.error && 'status' in query.error && query.error.status === 404 ? 'Staff account not found' : 'Could not load staff account'} detail="The staff record is unavailable. It may have been changed by another administrator." /> : <div className="mt-7 max-w-2xl"><StaffForm initialValues={{ name: query.data.name, email: query.data.email }} submitting={mutation.isPending} serverErrors={serverError ? { ...serverError.fields, form: serverError.fields.form ?? (Object.keys(serverError.fields).length ? undefined : serverError.message) } : undefined} submitLabel="Save changes" onCancel={() => navigate(`/admin/users/${staffId}`)} onSubmit={submit} /></div>}</AdminLayout>;
}
