import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';

export const REPORT_TYPES = ['books', 'circulation', 'fines', 'members', 'seats'] as const;
export type ReportType = typeof REPORT_TYPES[number];

export class ReportQueryDto {
  @ApiPropertyOptional({ format: 'date' }) @IsOptional() @IsISO8601({ strict: true }) dateFrom?: string;
  @ApiPropertyOptional({ format: 'date' }) @IsOptional() @IsISO8601({ strict: true }) dateTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() memberType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seatType?: string;
}

export class ExportReportQueryDto extends ReportQueryDto {
  @ApiPropertyOptional({ enum: REPORT_TYPES }) @IsIn(REPORT_TYPES) reportType!: ReportType;
  @ApiPropertyOptional({ enum: ['csv', 'xlsx', 'pdf'] }) @IsIn(['csv', 'xlsx', 'pdf']) format!: 'csv' | 'xlsx' | 'pdf';
}

export class AiReportSummaryDto extends ReportQueryDto {
  @ApiPropertyOptional({ enum: REPORT_TYPES }) @IsIn(REPORT_TYPES) reportType!: ReportType;
}
