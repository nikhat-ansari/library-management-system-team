import { Body, Controller, Get, Headers, Put, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SystemHealthService } from './system-health.service';
import { AiSettingsResponseDto, UpdateAiSettingsDto } from './dto/ai-settings.dto';

@ApiTags('module-8-internal')
@Controller('admin')
export class SystemHealthController {
  constructor(private readonly service: SystemHealthService) {}
  private actor(actorId?: string) { if (!actorId) throw new UnauthorizedException('Internal authenticated actor is required'); return actorId; }
  @Get('system-health') @ApiOkResponse() systemHealth() { return this.service.getSystemHealth(); }
  @Get('ai-settings') @ApiOkResponse({ type: AiSettingsResponseDto }) aiSettings() { return this.service.getAiSettings(); }
  @Put('ai-settings') @ApiBody({ type: UpdateAiSettingsDto }) @ApiOkResponse({ type: AiSettingsResponseDto }) updateAiSettings(@Body() dto: UpdateAiSettingsDto, @Headers('x-audit-actor-id') actorId?: string) { return this.service.updateAiSettings(dto, this.actor(actorId)); }
  @Get('ai-feedback') @ApiOkResponse() aiFeedback() { return this.service.getAiFeedback(); }
}
