/** Module 5 data contract. Reservation and seat policy fields await backend confirmation. */
export interface AdminSystemSettings {
  loanPeriod: number;
  borrowingLimit: number;
  fineRate: number;
  fineCap: number;
}

export type AdminSystemSettingsInput = AdminSystemSettings;

export type AdminSystemSettingsFormValues = Record<keyof AdminSystemSettingsInput, string>;

export interface HolidayDate {
  id: string;
  date: string;
}

export interface SystemSettingsValidationErrors {
  loanPeriod?: string;
  borrowingLimit?: string;
  fineRate?: string;
  fineCap?: string;
  holidayDate?: string;
}
