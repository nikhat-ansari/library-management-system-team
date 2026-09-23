import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BookQueryDto {
  @ApiPropertyOptional({ type: String, description: 'Search by title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ type: String, description: 'Search by ISBN' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by categoryId' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by authorId' })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by publisherId' })
  @IsOptional()
  @IsString()
  publisherId?: string;

  @ApiPropertyOptional({ type: Number, description: 'Number of items to skip', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({ type: Number, description: 'Number of items to return', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
