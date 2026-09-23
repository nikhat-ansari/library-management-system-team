import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookCopyDto {
  @ApiProperty({ description: 'Unique accession number for the physical copy', example: 'ACC-2023-001' })
  @IsString()
  @IsNotEmpty()
  accessionNumber!: string;

  @ApiPropertyOptional({ description: 'Optional barcode or QR code identifier', example: 'BC-987654321' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Physical condition of the book', example: 'New' })
  @IsString()
  @IsOptional()
  condition?: string;
}
