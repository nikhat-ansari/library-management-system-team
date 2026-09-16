export const reportTypes = ['books', 'circulation', 'fines', 'members', 'seats'] as const;
export type ReportType = typeof reportTypes[number];
export type ReportFilters = { dateFrom?: string; dateTo?: string; status?: string; category?: string; memberType?: string; seatType?: string };
export type ReportRow = Record<string, string | number | boolean | null | undefined>;
export type AdminReport = { reportType: ReportType; dateRange: { from?: string; to?: string }; filters: Record<string, string>; summary: Record<string, number>; rows: ReportRow[]; generatedAt: string };
export type AiSummary = { content?: string; generatedAt?: string };
