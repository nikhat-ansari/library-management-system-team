import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LostDamagedDto {
  @ApiProperty({ description: 'Reason or notes for the lost/damaged status', example: 'Member reported it lost' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class FoundDto {
  @ApiProperty({ description: 'Notes on finding the copy', example: 'Found in the shelf behind another book' })
  @IsString()
  @IsOptional()
  reason?: string;
}
