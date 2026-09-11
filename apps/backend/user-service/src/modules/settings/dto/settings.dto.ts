import { Type } from 'class-transformer'; import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';
export class UpdateSystemSettingsDto {
  @ApiProperty({ example: 14, minimum: 1 }) @Type(() => Number) @IsInt() @Min(1) loanPeriod!: number;
  @ApiProperty({ example: 5, minimum: 0 }) @Type(() => Number) @IsInt() @Min(0) borrowingLimit!: number;
  @ApiProperty({ example: 1, minimum: 0 }) @Type(() => Number) @IsNumber({ allowNaN: false, allowInfinity: false }) @Min(0) fineRate!: number;
  @ApiProperty({ example: 25, minimum: 0 }) @Type(() => Number) @IsNumber({ allowNaN: false, allowInfinity: false }) @Min(0) fineCap!: number;
}
