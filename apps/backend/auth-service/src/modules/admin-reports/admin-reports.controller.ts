import { Body, Controller, Get, Post, Query, Res, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AiReportSummaryDto, ExportReportQueryDto, ReportQueryDto } from './dto/report-query.dto';
import { ReportsDataService } from './reports-data.service';
import { ReportsExportService } from './reports-export.service';

@ApiTags('admin-reports') @ApiBearerAuth() @Controller('admin/reports') @UseGuards(JwtGuard, RolesGuard) @Roles('ADMIN')
export class AdminReportsController {
  constructor(private readonly reports: ReportsDataService, private readonly exports: ReportsExportService) {}
  @Get('books') @ApiOperation({ summary: 'Read the official books report' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() books(@Query() query: ReportQueryDto) { return this.reports.report('books', query); }
  @Get('circulation') @ApiOperation({ summary: 'Read the official circulation report' }) @ApiOkResponse() circulation(@Query() query: ReportQueryDto) { return this.reports.report('circulation', query); }
  @Get('fines') @ApiOperation({ summary: 'Read the official fines report' }) @ApiOkResponse() fines(@Query() query: ReportQueryDto) { return this.reports.report('fines', query); }
  @Get('members') @ApiOperation({ summary: 'Read the official members report' }) @ApiOkResponse() members(@Query() query: ReportQueryDto) { return this.reports.report('members', query); }
  @Get('seats') @ApiOperation({ summary: 'Read the official seats report' }) @ApiOkResponse() seats(@Query() query: ReportQueryDto) { return this.reports.report('seats', query); }
  @Get('export') @ApiOperation({ summary: 'Export the same filtered official report as CSV, XLSX, or PDF' }) async export(@Query() query: ExportReportQueryDto, @Res() response: Response): Promise<void> { const report = await this.reports.report(query.reportType, query); const file = await this.exports.create(report, query.format); response.setHeader('Content-Type', file.contentType); response.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`); response.end(file.data); }
}

@ApiTags('ai-reports') @ApiBearerAuth() @Controller('ai/admin/reports') @UseGuards(JwtGuard, RolesGuard) @Roles('ADMIN')
export class AiAdminReportsController {
  @Post('summary') @ApiOperation({ summary: 'Optional AI trend summary for an official filtered report' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  summary(@Body() _query: AiReportSummaryDto) { throw new ServiceUnavailableException({ available: false, message: 'AI report summaries are not configured. Official reports remain available.' }); }
}
