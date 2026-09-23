import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CopyStatus } from '../schemas/book-copy.schema';

export class UpdateStatusDto {
  @ApiProperty({ description: 'The new status to apply to the book copy', enum: [CopyStatus.AVAILABLE, CopyStatus.MAINTENANCE, CopyStatus.ISSUED, CopyStatus.RESERVED] })
  @IsEnum(CopyStatus)
  @IsNotEmpty()
  status!: CopyStatus;
}
