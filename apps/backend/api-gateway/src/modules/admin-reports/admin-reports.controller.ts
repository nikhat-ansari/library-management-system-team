import { Body, Controller, Get, Headers, HttpException, HttpStatus, Post, Query, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiForbiddenResponse, ApiOperation, ApiProduces, ApiQuery, ApiResponse, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import axios from 'axios';
import { AiReportSummaryDto } from './dto/ai-report-summary.dto';

@ApiTags('admin-reports') @ApiBearerAuth() @Controller('admin/reports')
export class AdminReportsController {
  private readonly url = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  private authorization(value?: string) { if (!value) throw new UnauthorizedException('Missing access token'); return { Authorization: value }; }
  private async read(name: string, query: Record<string, string | undefined>, authorization?: string) { try { return (await axios.get(`${this.url}/api/admin/reports/${name}`, { params: query, headers: this.authorization(authorization) })).data; } catch (error) { this.throwHttp(error); } }
  private throwHttp(error: unknown): never { if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Authentication service unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE); throw error; }
  @Get('books') @ApiOperation({ summary: 'Get books report (ADMIN only)' }) books(@Query() query: Record<string, string | undefined>, @Headers('authorization') auth?: string) { return this.read('books', query, auth); }
  @Get('circulation') circulation(@Query() query: Record<string, string | undefined>, @Headers('authorization') auth?: string) { return this.read('circulation', query, auth); }
  @Get('fines') fines(@Query() query: Record<string, string | undefined>, @Headers('authorization') auth?: string) { return this.read('fines', query, auth); }
  @Get('members') members(@Query() query: Record<string, string | undefined>, @Headers('authorization') auth?: string) { return this.read('members', query, auth); }
  @Get('seats') seats(@Query() query: Record<string, string | undefined>, @Headers('authorization') auth?: string) { return this.read('seats', query, auth); }
  @Get('export')
  @ApiOperation({ summary: 'Export an official filtered report', description: 'Requires an authenticated ADMIN bearer token. The exported rows use the same filtered scope as the selected report.' })
  @ApiQuery({ name: 'reportType', required: true, enum: ['books', 'circulation', 'fines', 'members', 'seats'], example: 'members' })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'xlsx', 'pdf'], example: 'xlsx' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, format: 'date', example: '2026-09-01' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, format: 'date', example: '2026-09-30' })
  @ApiQuery({ name: 'status', required: false, type: String }) @ApiQuery({ name: 'category', required: false, type: String }) @ApiQuery({ name: 'memberType', required: false, type: String }) @ApiQuery({ name: 'seatType', required: false, type: String })
  @ApiProduces('text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf')
  @ApiResponse({ status: 200, description: 'Binary report download. Content-Disposition supplies the attachment filename.' })
  @ApiBadRequestResponse({ description: 'Invalid report type, format, or filters.' }) @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' }) @ApiForbiddenResponse({ description: 'ADMIN role is required.' })
  async export(@Query() query: Record<string, string | undefined>, @Headers('authorization') auth: string | undefined, @Res() response: Response) { try { const result = await axios.get<ArrayBuffer>(`${this.url}/api/admin/reports/export`, { params: query, headers: this.authorization(auth), responseType: 'arraybuffer' }); response.setHeader('Content-Type', String(result.headers['content-type'] ?? 'application/octet-stream')); response.setHeader('Content-Disposition', String(result.headers['content-disposition'] ?? 'attachment')); response.send(Buffer.from(result.data)); } catch (error) { this.throwHttp(error); } }
}

@ApiTags('ai-reports') @ApiBearerAuth() @Controller('ai/admin/reports')
export class AiAdminReportsController {
  private readonly url = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  @Post('summary') @ApiOperation({ summary: 'Request an optional AI trend summary', description: 'Requires an authenticated ADMIN bearer token. AI never changes official report records or totals.' })
  @ApiConsumes('application/json') @ApiBody({ type: AiReportSummaryDto, examples: { books: { summary: 'Books report summary request', value: { reportType: 'books', dateFrom: '2026-09-01', dateTo: '2026-09-30', category: 'Science' } } } })
  @ApiResponse({ status: 200, description: 'AI trend summary when AI is enabled and available.' }) @ApiBadRequestResponse({ description: 'Invalid report type or filters.' }) @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' }) @ApiForbiddenResponse({ description: 'ADMIN role is required.' }) @ApiServiceUnavailableResponse({ description: 'AI summaries are disabled or unavailable; official reports remain available.' })
  async summary(@Body() query: AiReportSummaryDto, @Headers('authorization') auth?: string) { if (!auth) throw new UnauthorizedException('Missing access token'); try { return (await axios.post(`${this.url}/api/ai/admin/reports/summary`, query, { headers: { Authorization: auth } })).data; } catch (error) { if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Authentication service unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE); throw error; } }
}
