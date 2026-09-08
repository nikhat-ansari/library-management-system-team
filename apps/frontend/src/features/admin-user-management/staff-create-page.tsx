import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { adminUserManagementService, toStaffApiError } from '../../services/admin-user-management-service';
import type { StaffApiError } from '../../types/admin-user-management';
import { AdminLayout } from '../admin/admin-layout';
import { StaffForm, type StaffFormValues } from './staff-form';
import { StaffPageHeader } from './staff-ui';

export function StaffCreatePage() {
  const navigate = useNavigate(); const queryClient = useQueryClient(); const [serverError, setServerError] = useState<StaffApiError>();
  const mutation = useMutation({ mutationFn: adminUserManagementService.createStaff, onSuccess: async (staff) => { await queryClient.invalidateQueries({ queryKey: ['admin-users'] }); navigate(`/admin/users/${staff.id}`, { replace: true, state: { notice: `${staff.name}'s staff account was created.` } }); }, onError: (error) => setServerError(toStaffApiError(error, 'Staff account could not be created. Please try again.')) });
  const submit = async (values: StaffFormValues) => { setServerError(undefined); await mutation.mutateAsync({ ...values, role: 'LIBRARIAN_STAFF' }); };
  return <AdminLayout><StaffPageHeader title="Add staff account" description="Create a librarian or staff account for daily library operations." action={<Link to="/admin/users" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">Back to User Management</Link>} /><div className="mt-7 max-w-2xl"><StaffForm initialValues={{ name: '', email: '', role: 'LIBRARIAN_STAFF' }} submitting={mutation.isPending} serverErrors={serverError ? { ...serverError.fields, form: serverError.fields.form ?? (Object.keys(serverError.fields).length ? undefined : serverError.message) } : undefined} submitLabel="Create staff account" showRole onCancel={() => navigate('/admin/users')} onSubmit={submit} /></div></AdminLayout>;
}
