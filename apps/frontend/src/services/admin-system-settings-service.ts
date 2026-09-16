import { apiClient } from '../lib/axios';
import type { AdminSystemSettings, AdminSystemSettingsInput, HolidayDate } from '../types/admin-system-settings';

/**
 * Module 5 integration boundary. Confirm these endpoints and response shapes
 * with the backend teammate before enabling end-to-end delivery.
 */
const module5Paths = {
  settings: '/admin/settings',
  holidays: '/admin/holidays',
} as const;

type HolidayListResponse = { holidays: HolidayDate[] };

export const adminSystemSettingsService = {
  async getSettings(): Promise<AdminSystemSettings> {
    const { data } = await apiClient.get<AdminSystemSettings>(module5Paths.settings);
    return data;
  },

  async updateSettings(input: AdminSystemSettingsInput): Promise<AdminSystemSettings> {
    const { data } = await apiClient.put<AdminSystemSettings>(module5Paths.settings, input);
    return data;
  },

  async getHolidays(): Promise<HolidayDate[]> {
    const { data } = await apiClient.get<HolidayListResponse>(module5Paths.holidays);
    return data.holidays;
  },

  async addHoliday(date: string): Promise<HolidayDate> {
    const { data } = await apiClient.post<HolidayDate>(module5Paths.holidays, { date });
    return data;
  },

  async removeHoliday(holidayId: string): Promise<void> {
    await apiClient.delete(`${module5Paths.holidays}/${holidayId}`);
  },
};
