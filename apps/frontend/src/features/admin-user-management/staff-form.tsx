import { useState, type FormEvent } from 'react';
import type { CreateStaffRequest, StaffValidationErrors, UpdateStaffRequest } from '../../types/admin-user-management';

export type StaffFormValues = CreateStaffRequest | UpdateStaffRequest;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: StaffFormValues): StaffValidationErrors {
  const fields: StaffValidationErrors = {};
  if (!values.name.trim()) fields.name = 'Enter the staff member\'s name.';
  if (!values.email.trim()) fields.email = 'Enter an email address.';
  else if (!emailPattern.test(values.email.trim())) fields.email = 'Enter a valid email address.';
  return fields;
}

export function StaffForm({ initialValues, submitting, serverErrors, submitLabel, onCancel, onSubmit, showRole = false }: {
  initialValues: StaffFormValues;
  submitting: boolean;
  serverErrors?: StaffValidationErrors;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: StaffFormValues) => Promise<void>;
  showRole?: boolean;
}) {
  const [values, setValues] = useState<StaffFormValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<StaffValidationErrors>({});
  const errors = { ...clientErrors, ...serverErrors };
  const update = (key: 'name' | 'email', value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setClientErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = { ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() };
    const validation = validate(normalized);
    if (Object.keys(validation).length) { setClientErrors(validation); return; }
    await onSubmit(normalized);
  };
  return <form noValidate onSubmit={(event) => void submit(event)} className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4 sm:px-6"><h2 className="text-base font-semibold text-slate-950">Account information</h2><p className="mt-1 text-sm text-slate-500">Use the librarian\'s work email. They will receive access according to the backend account policy.</p></div><div className="grid gap-5 p-5 sm:p-6"><div><label className="form-label" htmlFor="staff-name">Name <span className="text-red-700">*</span></label><input id="staff-name" className="form-input" value={values.name} onChange={(event) => update('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'staff-name-error' : undefined} autoComplete="name" disabled={submitting} />{errors.name && <p id="staff-name-error" className="field-error">{errors.name}</p>}</div><div><label className="form-label" htmlFor="staff-email">Email <span className="text-red-700">*</span></label><input id="staff-email" className="form-input" type="email" value={values.email} onChange={(event) => update('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'staff-email-error' : undefined} autoComplete="email" disabled={submitting} />{errors.email && <p id="staff-email-error" className="field-error">{errors.email}</p>}</div>{showRole && <div><label className="form-label" htmlFor="staff-role">Role</label><input id="staff-role" className="form-input bg-slate-50 text-slate-600" value="Librarian / Staff" readOnly aria-describedby="staff-role-help" /><p id="staff-role-help" className="mt-2 text-sm text-slate-500">This module can create staff accounts only.</p></div>}{errors.form && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{errors.form}</p>}</div><div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><button type="button" onClick={onCancel} disabled={submitting} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700 disabled:opacity-60">Cancel</button><button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-indigo-700 px-5 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400">{submitting ? 'Saving account…' : submitLabel}</button></div></form>;
}
