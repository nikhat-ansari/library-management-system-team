import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsIn, IsString } from 'class-validator';

const CODES = ['BOOK_MANAGEMENT', 'MEMBER_MANAGEMENT', 'ISSUE_RETURN_RENEWAL', 'FINE_MANAGEMENT', 'RESERVATION_MANAGEMENT', 'SHELF_MANAGEMENT', 'SEAT_MANAGEMENT', 'OPERATIONAL_REPORT_ACCESS'];
export class ReplacePermissionsDto {
  @ApiProperty({ type: [String], enum: CODES, example: ['ISSUE_RETURN_RENEWAL'] })
  @IsArray() @IsString({ each: true }) @IsIn(CODES, { each: true }) @ArrayUnique() permissions!: string[];
}
