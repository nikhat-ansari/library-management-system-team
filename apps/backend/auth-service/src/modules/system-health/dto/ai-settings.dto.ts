import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAiSettingsDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  enabled!: boolean;
}

export class AiSettingsResponseDto {
  @ApiProperty({ example: true })
  enabled!: boolean;
}
