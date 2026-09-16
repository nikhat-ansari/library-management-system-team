export type AuditActor = { id: string; name: string; email: string | null };
export type AuditRecordReference = { id: string; type: string };
export type AuditSummary = Record<string, unknown>;
export type AuditLog = { id: string; actor?: AuditActor; action: string; module: string; recordReference?: AuditRecordReference; timestamp: string; oldChangeSummary: AuditSummary | null; newChangeSummary: AuditSummary | null };
export type AuditLogMeta = { page: number; limit: number; total: number; totalPages: number };
export type AuditLogResponse = { data: AuditLog[]; meta: AuditLogMeta };
export type AuditLogFilters = { page?: number; limit?: number; action?: string; module?: string; actorId?: string; recordReference?: string; search?: string; from?: string; to?: string };

export const auditActions = ['USER_CREATED', 'USER_UPDATED', 'USER_STATUS_CHANGED', 'PERMISSIONS_CHANGED', 'SYSTEM_SETTINGS_UPDATED', 'HOLIDAY_CREATED', 'HOLIDAY_DELETED'] as const;
export const auditModules = ['USER_MANAGEMENT', 'PERMISSIONS', 'SYSTEM_SETTINGS', 'HOLIDAY_CALENDAR'] as const;
