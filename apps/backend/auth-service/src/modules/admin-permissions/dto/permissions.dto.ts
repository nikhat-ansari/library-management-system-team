import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsIn, IsString } from 'class-validator';

export const OPERATIONAL_PERMISSION_CODES = ['BOOK_MANAGEMENT', 'MEMBER_MANAGEMENT', 'ISSUE_RETURN_RENEWAL', 'FINE_MANAGEMENT', 'RESERVATION_MANAGEMENT', 'SHELF_MANAGEMENT', 'SEAT_MANAGEMENT', 'OPERATIONAL_REPORT_ACCESS'] as const;
export class ReplacePermissionsDto {
  @ApiProperty({ type: [String], enum: OPERATIONAL_PERMISSION_CODES, example: ['ISSUE_RETURN_RENEWAL', 'RESERVATION_MANAGEMENT'] })
  @IsArray() @IsString({ each: true }) @IsIn(OPERATIONAL_PERMISSION_CODES, { each: true }) @ArrayUnique() permissions!: string[];
}
