import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsIn, IsString } from 'class-validator';
import { OPERATIONAL_PERMISSION_CODES, OperationalPermissionCode } from '../../../schemas/staff-permission.schema';


export class ReplacePermissionsDto {
  @ApiProperty({ type: [String], enum: OPERATIONAL_PERMISSION_CODES, example: ['ISSUE_RETURN_RENEWAL', 'RESERVATION_MANAGEMENT'] })
  @IsArray()
  @IsString({ each: true })
  @IsIn(OPERATIONAL_PERMISSION_CODES, { each: true })
  @ArrayUnique()
  permissions!: OperationalPermissionCode[];
}
