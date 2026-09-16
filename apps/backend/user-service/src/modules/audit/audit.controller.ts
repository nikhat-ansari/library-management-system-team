import { Controller, Get, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@Controller('admin/audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Query() query: AuditLogQueryDto, @Headers('x-audit-actor-id') actorId?: string) {
    if (!actorId) throw new UnauthorizedException('Internal authenticated actor is required');
    return this.audit.list(query);
  }
}
