import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional, IsString } from 'class-validator';

export class AiReportSummaryDto {
  @ApiProperty({ enum: ['books', 'circulation', 'fines', 'members', 'seats'], example: 'books' })
  @IsIn(['books', 'circulation', 'fines', 'members', 'seats'])
  reportType!: 'books' | 'circulation' | 'fines' | 'members' | 'seats';

  @ApiPropertyOptional({ format: 'date', example: '2026-09-01' })
  @IsOptional() @IsISO8601({ strict: true })
  dateFrom?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-09-30' })
  @IsOptional() @IsISO8601({ strict: true })
  dateTo?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ example: 'Science' }) @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional({ example: 'STUDENT' }) @IsOptional() @IsString() memberType?: string;
  @ApiPropertyOptional({ example: 'READING_DESK' }) @IsOptional() @IsString() seatType?: string;
}
