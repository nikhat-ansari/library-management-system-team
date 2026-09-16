import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument = require('pdfkit');
import { ReportResult } from './reports-data.service';

@Injectable()
export class ReportsExportService {
  async create(report: ReportResult, format: 'csv' | 'xlsx' | 'pdf'): Promise<{ contentType: string; filename: string; data: Buffer }> {
    const base = `${report.reportType}-report-${report.generatedAt.slice(0, 10)}`;
    if (format === 'csv') return { contentType: 'text/csv; charset=utf-8', filename: `${base}.csv`, data: Buffer.from(this.csv(report), 'utf8') };
    if (format === 'xlsx') return { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `${base}.xlsx`, data: await this.xlsx(report) };
    return { contentType: 'application/pdf', filename: `${base}.pdf`, data: await this.pdf(report) };
  }

  private headers(report: ReportResult) { return Array.from(new Set(report.rows.flatMap((row) => Object.keys(row)))); }
  private csvValue(value: unknown) { const text = value == null ? '' : String(value); return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; }
  private csv(report: ReportResult) { const headers = this.headers(report); return [headers.join(','), ...report.rows.map((row) => headers.map((header) => this.csvValue(row[header])).join(','))].join('\r\n'); }
  private async xlsx(report: ReportResult) {
    const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet('Report'); const headers = this.headers(report);
    sheet.addRow(headers); sheet.getRow(1).font = { bold: true }; report.rows.forEach((row) => sheet.addRow(headers.map((header) => row[header] == null ? '' : String(row[header]))));
    sheet.columns.forEach((column) => { column.width = 20; }); return Buffer.from(await workbook.xlsx.writeBuffer());
  }
  private pdf(report: ReportResult): Promise<Buffer> {
    return new Promise((resolve, reject) => { const document = new PDFDocument({ margin: 36, size: 'A4' }); const chunks: Buffer[] = []; document.on('data', (chunk: Buffer) => chunks.push(chunk)); document.on('end', () => resolve(Buffer.concat(chunks))); document.on('error', reject); document.fontSize(18).text(`${report.reportType} report`); document.fontSize(9).text(`Generated: ${report.generatedAt}`); document.text(`Range: ${report.dateRange.from ?? 'all'} to ${report.dateRange.to ?? 'all'}`); document.moveDown().fontSize(10).text(`Summary: ${JSON.stringify(report.summary)}`); const headers = this.headers(report); report.rows.forEach((row) => { if (document.y > 740) document.addPage(); document.fontSize(8).text(headers.map((header) => `${header}: ${row[header] ?? ''}`).join(' | ')); }); document.end(); });
  }
}
