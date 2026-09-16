import { Controller, Get, Headers, HttpException, HttpStatus, Query, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios';

@ApiTags('admin-audit-logs') @ApiBearerAuth() @Controller('admin/audit-logs')
export class AdminAuditController {
  private readonly url = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  @Get()
  @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse()
  async list(@Query() query: Record<string, string | undefined>, @Headers('authorization') authorization?: string) {
    if (!authorization) throw new UnauthorizedException('Missing access token');
    try { return (await axios.get(`${this.url}/api/admin/audit-logs`, { params: query, headers: { Authorization: authorization } })).data; }
    catch (error) { if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Authentication service unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE); throw error; }
  }
}
