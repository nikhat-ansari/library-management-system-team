import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { adminSystemSettingsService } from '../../services/admin-system-settings-service';
import type { AdminSystemSettings, AdminSystemSettingsFormValues, AdminSystemSettingsInput, SystemSettingsValidationErrors } from '../../types/admin-system-settings';
import { AdminLayout } from '../admin/admin-layout';
import { StaffPageHeader } from '../admin-user-management/staff-ui';
import { HolidayCalendarSection } from './holiday-calendar-section';
import { SystemSettingsForm } from './system-settings-form';

const toFormValues = (settings: AdminSystemSettings): AdminSystemSettingsFormValues => ({ loanPeriod: String(settings.loanPeriod), borrowingLimit: String(settings.borrowingLimit), fineRate: String(settings.fineRate), fineCap: String(settings.fineCap) });
const sameValues = (left: AdminSystemSettingsFormValues, right: AdminSystemSettingsFormValues) => Object.keys(left).every((key) => left[key as keyof AdminSystemSettingsFormValues] === right[key as keyof AdminSystemSettingsFormValues]);

function errorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return 'Network connection is unavailable. Please try again.';
  if ([401, 403].includes(error.response?.status ?? 0)) return 'You do not have permission to perform this action.';
  return fallback;
}

function validate(values: AdminSystemSettingsFormValues): { errors: SystemSettingsValidationErrors; input?: AdminSystemSettingsInput } {
  const errors: SystemSettingsValidationErrors = {};
  const parsed = {} as AdminSystemSettingsInput;
  (Object.keys(values) as Array<keyof AdminSystemSettingsFormValues>).forEach((field) => {
    const value = values[field].trim();
    if (!value) { errors[field] = 'Enter a value.'; return; }
    const number = Number(value);
    if (!Number.isFinite(number)) { errors[field] = 'Enter a valid number.'; return; }
    if (field === 'loanPeriod' && number <= 0) { errors[field] = 'Loan period must be greater than zero.'; return; }
    if (field !== 'loanPeriod' && number < 0) { errors[field] = 'Enter a non-negative value.'; return; }
    parsed[field] = number;
  });
  return Object.keys(errors).length ? { errors } : { errors, input: parsed };
}

function SettingsMessage({ text, retry }: { text: string; retry: () => void }) {
  return <section className="mt-7 rounded-xl border border-red-200 bg-red-50 p-5"><h2 className="font-semibold text-red-950">System settings are unavailable</h2><p role="alert" className="mt-2 text-sm leading-6 text-red-800">{text}</p><button type="button" onClick={retry} className="mt-4 min-h-10 rounded-lg border border-red-300 bg-white px-3.5 text-sm font-semibold text-red-900 hover:bg-red-50">Retry</button></section>;
}

function SettingsSkeleton() {
  return <div className="mt-7 grid gap-5 lg:grid-cols-2">{Array.from({ length: 5 }, (_, index) => <section key={index} className="h-52 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm" />)}</div>;
}

export function AdminSystemSettingsPage() {
  const queryClient = useQueryClient();
  const [formValues, setFormValues] = useState<AdminSystemSettingsFormValues>();
  const [validationErrors, setValidationErrors] = useState<SystemSettingsValidationErrors>({});
  const [saved, setSaved] = useState(false);
  const preserveSavedNotice = useRef(false);
  const settingsQuery = useQuery({ queryKey: ['admin', 'system-settings'], queryFn: adminSystemSettingsService.getSettings, retry: 1 });
  const holidaysQuery = useQuery({ queryKey: ['admin', 'system-settings', 'holidays'], queryFn: adminSystemSettingsService.getHolidays, enabled: settingsQuery.isSuccess, retry: 1 });
  const baseline = useMemo(() => settingsQuery.data ? toFormValues(settingsQuery.data) : undefined, [settingsQuery.data]);

  useEffect(() => {
    if (baseline) {
      setFormValues(baseline);
      setValidationErrors({});
      if (!preserveSavedNotice.current) setSaved(false);
      preserveSavedNotice.current = false;
    }
  }, [baseline]);

  const saveMutation = useMutation({ mutationFn: (input: AdminSystemSettingsInput) => adminSystemSettingsService.updateSettings(input), onSuccess: (settings) => { preserveSavedNotice.current = true; queryClient.setQueryData(['admin', 'system-settings'], settings); setFormValues(toFormValues(settings)); setSaved(true); } });
  const addHolidayMutation = useMutation({ mutationFn: adminSystemSettingsService.addHoliday, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['admin', 'system-settings', 'holidays'] }); } });
  const removeHolidayMutation = useMutation({ mutationFn: adminSystemSettingsService.removeHoliday, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['admin', 'system-settings', 'holidays'] }); } });

  const updateField = (field: keyof AdminSystemSettingsFormValues, value: string) => { setSaved(false); setFormValues((current) => current ? { ...current, [field]: value } : current); setValidationErrors((current) => ({ ...current, [field]: undefined })); };
  const save = () => {
    if (!formValues) return;
    const result = validate(formValues);
    setValidationErrors(result.errors);
    if (result.input) void saveMutation.mutateAsync(result.input);
  };
  const dirty = Boolean(formValues && baseline && !sameValues(formValues, baseline));

  return <AdminLayout><StaffPageHeader title="System Settings" description="Configure library policies and the holiday calendar." />{settingsQuery.isLoading ? <SettingsSkeleton /> : settingsQuery.isError ? <SettingsMessage text={errorMessage(settingsQuery.error, 'System settings could not be loaded. Please try again.')} retry={() => void settingsQuery.refetch()} /> : formValues ? <><SystemSettingsForm values={formValues} errors={validationErrors} saving={saveMutation.isPending} onChange={updateField} /><section className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div>{saved && <p role="status" className="text-sm font-medium text-emerald-800">System settings updated successfully.</p>}{saveMutation.isError && <p role="alert" className="text-sm font-medium text-red-800">{errorMessage(saveMutation.error, 'System settings could not be updated. Please try again.')}</p>}{!saved && !saveMutation.isError && <p className="text-sm text-slate-600">{dirty ? 'You have unsaved changes.' : 'Change a setting to enable saving.'}</p>}</div><button type="button" disabled={!dirty || saveMutation.isPending} onClick={save} className="min-h-11 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">{saveMutation.isPending ? 'Saving settings...' : 'Save settings'}</button></section><HolidayCalendarSection holidays={holidaysQuery.data ?? []} loading={holidaysQuery.isLoading} error={holidaysQuery.isError ? errorMessage(holidaysQuery.error, 'Holidays could not be loaded. Please try again.') : addHolidayMutation.isError ? errorMessage(addHolidayMutation.error, 'Holiday could not be added. Please try again.') : removeHolidayMutation.isError ? errorMessage(removeHolidayMutation.error, 'Holiday could not be removed. Please try again.') : undefined} adding={addHolidayMutation.isPending} removingId={removeHolidayMutation.isPending ? removeHolidayMutation.variables : undefined} onAdd={async (date) => { await addHolidayMutation.mutateAsync(date); }} onRemove={(id) => removeHolidayMutation.mutateAsync(id)} onRetry={() => void holidaysQuery.refetch()} /></> : <SettingsMessage text="System settings could not be prepared. Please try again." retry={() => void settingsQuery.refetch()} />}</AdminLayout>;
}
