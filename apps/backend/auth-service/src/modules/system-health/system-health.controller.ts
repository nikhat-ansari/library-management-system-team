import { Body, Controller, Get, HttpException, HttpStatus, Put, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import axios from 'axios';
import { CurrentUser } from '../../common/decorators/auth-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AiSettingsResponseDto, UpdateAiSettingsDto } from './dto/ai-settings.dto';

@ApiTags('admin-system-health')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class SystemHealthController {
  private readonly url = process.env.USER_SERVICE_URL ?? 'http://localhost:3002';

  private async call<T>(request: () => Promise<T>): Promise<T> {
    try { return await request(); }
    catch (error: unknown) {
      if (axios.isAxiosError(error)) throw new HttpException(error.response?.data?.message ?? 'System health data is unavailable', error.response?.status ?? HttpStatus.SERVICE_UNAVAILABLE);
      throw new ServiceUnavailableException('System health data is unavailable');
    }
  }

  @Get('system-health')
  @ApiOperation({ summary: 'Get the SRS system-health summary', description: 'Admin-only status information. This is not infrastructure or DevOps monitoring.' })
  @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  systemHealth() { return this.call(() => axios.get(`${this.url}/api/admin/system-health`).then((result) => result.data)); }

  @Get('ai-settings')
  @ApiOperation({ summary: 'Get persisted AI availability settings' })
  @ApiOkResponse({ type: AiSettingsResponseDto }) @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  aiSettings() { return this.call(() => axios.get(`${this.url}/api/admin/ai-settings`).then((result) => result.data)); }

  @Put('ai-settings')
  @ApiOperation({ summary: 'Persist AI availability settings' })
  @ApiBody({ type: UpdateAiSettingsDto }) @ApiOkResponse({ type: AiSettingsResponseDto }) @ApiBadRequestResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  updateAiSettings(@Body() dto: UpdateAiSettingsDto, @CurrentUser() user: { userId: string }) { return this.call(() => axios.put(`${this.url}/api/admin/ai-settings`, dto, { headers: { 'x-audit-actor-id': user.userId } }).then((result) => result.data)); }

  @Get('ai-feedback')
  @ApiOperation({ summary: 'Get aggregate AI Helpful and Not Helpful feedback' })
  @ApiOkResponse() @ApiUnauthorizedResponse() @ApiForbiddenResponse() @ApiServiceUnavailableResponse()
  aiFeedback() { return this.call(() => axios.get(`${this.url}/api/admin/ai-feedback`).then((result) => result.data)); }
}
