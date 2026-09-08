import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsString } from 'class-validator';
import { OPERATIONAL_PERMISSIONS, OperationalPermissionCode } from '../users.service';

export const OPERATIONAL_PERMISSION_CODES = OPERATIONAL_PERMISSIONS.map((permission) => permission.code) as OperationalPermissionCode[];

export class ReplacePermissionsDto {
  @ApiProperty({ type: [String], enum: OPERATIONAL_PERMISSION_CODES, example: ['ISSUE_RETURN_RENEWAL', 'RESERVATION_MANAGEMENT'] })
  @IsArray()
  @IsString({ each: true })
  @IsIn(OPERATIONAL_PERMISSION_CODES, { each: true })
  permissions!: OperationalPermissionCode[];
}
