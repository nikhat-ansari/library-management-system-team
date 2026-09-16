import { apiClient } from '../lib/axios';
import type { AdminReport, AiSummary, ReportFilters, ReportType } from '../types/admin-reports';

const path = (type: ReportType) => `/admin/reports/${type}`;
const params = (filters: ReportFilters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
export const adminReportsService = {
  getReport: async (type: ReportType, filters: ReportFilters) => (await apiClient.get<AdminReport>(path(type), { params: params(filters) })).data,
  getAiSummary: async (type: ReportType, filters: ReportFilters) => (await apiClient.post<AiSummary>('/ai/admin/reports/summary', { reportType: type, ...params(filters) })).data,
  export: async (type: ReportType, format: 'csv' | 'xlsx' | 'pdf', filters: ReportFilters) => apiClient.get('/admin/reports/export', { params: { reportType: type, format, ...params(filters) }, responseType: 'blob' }),
};
