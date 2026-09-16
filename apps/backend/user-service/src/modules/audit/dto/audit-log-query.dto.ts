import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const AUDIT_ACTIONS = ['USER_CREATED', 'USER_UPDATED', 'USER_STATUS_CHANGED', 'PERMISSIONS_CHANGED', 'SYSTEM_SETTINGS_UPDATED', 'HOLIDAY_CREATED', 'HOLIDAY_DELETED'] as const;
export const AUDIT_MODULES = ['USER_MANAGEMENT', 'PERMISSIONS', 'SYSTEM_SETTINGS', 'HOLIDAY_CALENDAR'] as const;

export class AuditLogQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number;

  @IsOptional() @IsIn(AUDIT_ACTIONS)
  action?: (typeof AUDIT_ACTIONS)[number];

  @IsOptional() @IsIn(AUDIT_MODULES)
  module?: (typeof AUDIT_MODULES)[number];

  @IsOptional() @IsString()
  actorId?: string;

  @IsOptional() @IsString()
  recordReference?: string;

  @IsOptional() @IsString() @Max(100)
  search?: string;

  @IsOptional() @IsDateString()
  from?: string;

  @IsOptional() @IsDateString()
  to?: string;
}
