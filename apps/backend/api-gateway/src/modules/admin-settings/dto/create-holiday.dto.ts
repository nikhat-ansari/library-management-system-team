import { ApiProperty } from '@nestjs/swagger'; import { Matches } from 'class-validator';
export class CreateHolidayDto { @ApiProperty({ example: '2026-12-25', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }) @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be a calendar date in YYYY-MM-DD format' }) date!: string; }
