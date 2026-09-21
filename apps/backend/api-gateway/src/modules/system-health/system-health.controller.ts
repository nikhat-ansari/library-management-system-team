import { Body, Controller, Get, Headers, HttpException, HttpStatus, Put, UnauthorizedException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios';
import { UpdateAiSettingsDto } from './dto/ai-settings.dto';

@ApiTags('admin-system-health')
@ApiBearerAuth()
@Controller('admin')
export class SystemHealthController {
  private readonly url = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  private authorization(value?: string) { if (!value) throw new UnauthorizedException('Missing access token'); return { Authorization: value }; }
  private async call<T>(request: () => Promise<T>): Promise<T> { try { return await request(); } catch (error: unknown) { if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'Authentication service unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE); throw error; } }
  @Get('system-health') @ApiOperation({ summary: 'Get the SRS system-health summary (ADMIN only)' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  systemHealth(@Headers('authorization') authorization?: string) { return this.call(() => axios.get(`${this.url}/api/admin/system-health`, { headers: this.authorization(authorization) }).then((result) => result.data)); }
  @Get('ai-settings') @ApiOperation({ summary: 'Get AI availability settings (ADMIN only)' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  aiSettings(@Headers('authorization') authorization?: string) { return this.call(() => axios.get(`${this.url}/api/admin/ai-settings`, { headers: this.authorization(authorization) }).then((result) => result.data)); }
  @Put('ai-settings') @ApiOperation({ summary: 'Persist AI availability settings (ADMIN only)' }) @ApiBody({ type: UpdateAiSettingsDto }) @ApiOkResponse() @ApiBadRequestResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  updateAiSettings(@Body() dto: UpdateAiSettingsDto, @Headers('authorization') authorization?: string) { return this.call(() => axios.put(`${this.url}/api/admin/ai-settings`, dto, { headers: this.authorization(authorization) }).then((result) => result.data)); }
  @Get('ai-feedback') @ApiOperation({ summary: 'Get aggregate AI feedback (ADMIN only)' }) @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  aiFeedback(@Headers('authorization') authorization?: string) { return this.call(() => axios.get(`${this.url}/api/admin/ai-feedback`, { headers: this.authorization(authorization) }).then((result) => result.data)); }
}
