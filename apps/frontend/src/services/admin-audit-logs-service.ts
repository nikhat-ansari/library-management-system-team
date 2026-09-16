import { apiClient } from '../lib/axios';
import type { AuditLogFilters, AuditLogResponse } from '../types/admin-audit-logs';

const populated = (filters: AuditLogFilters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''));
export const adminAuditLogsService = {
  getAuditLogs: async (filters: AuditLogFilters) => (await apiClient.get<AuditLogResponse>('/admin/audit-logs', { params: populated(filters) })).data,
};
