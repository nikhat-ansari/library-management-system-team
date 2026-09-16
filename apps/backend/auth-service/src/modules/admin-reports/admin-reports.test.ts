import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validate } from 'class-validator';
import { HttpException } from '@nestjs/common';
import { AiAdminReportsController } from './admin-reports.controller';
import { AiReportSummaryDto, ExportReportQueryDto } from './dto/report-query.dto';
import { ReportsExportService } from './reports-export.service';
import type { ReportResult } from './reports-data.service';

const report: ReportResult = { reportType: 'members', dateRange: { from: '2026-09-01', to: '2026-09-30' }, filters: { status: 'active' }, summary: { total: 1 }, rows: [{ id: 'member-1', name: 'Member One', status: 'active' }], generatedAt: '2026-09-12T00:00:00.000Z' };

describe('Module 6 report contracts and exports', () => {
  it('accepts a valid AI request DTO', async () => {
    const dto = Object.assign(new AiReportSummaryDto(), { reportType: 'members', dateFrom: '2026-09-01', dateTo: '2026-09-30', status: 'active' });
    assert.equal((await validate(dto)).length, 0);
  });
  it('rejects malformed report dates and unsupported export choices', async () => {
    const badDate = Object.assign(new AiReportSummaryDto(), { reportType: 'members', dateFrom: 'not-a-date' });
    const badExport = Object.assign(new ExportReportQueryDto(), { reportType: 'unknown', format: 'zip' });
    assert.ok((await validate(badDate)).length > 0); assert.ok((await validate(badExport)).length > 0);
  });
  it('creates valid CSV, XLSX, and PDF bytes from only supplied filtered rows', async () => {
    const exporter = new ReportsExportService(); const csv = await exporter.create(report, 'csv'); const xlsx = await exporter.create(report, 'xlsx'); const pdf = await exporter.create(report, 'pdf');
    assert.equal(csv.contentType, 'text/csv; charset=utf-8'); assert.match(csv.data.toString('utf8'), /Member One/); assert.doesNotMatch(csv.data.toString('utf8'), /Member Two/);
    assert.equal(xlsx.contentType, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); assert.equal(xlsx.data.subarray(0, 2).toString('ascii'), 'PK'); assert.match(xlsx.filename, /\.xlsx$/);
    assert.equal(pdf.contentType, 'application/pdf'); assert.equal(pdf.data.subarray(0, 5).toString('ascii'), '%PDF-'); assert.match(pdf.filename, /\.pdf$/);
  });
  it('returns a controlled 503 for a valid AI request', () => {
    assert.throws(() => new AiAdminReportsController().summary(Object.assign(new AiReportSummaryDto(), { reportType: 'members' })), (error: unknown) => error instanceof HttpException && error.getStatus() === 503);
  });
});
