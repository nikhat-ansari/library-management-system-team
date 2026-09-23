import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MetadataSuggestionDto {
  @ApiProperty({ type: String, description: 'Title of the book to lookup' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ type: String, description: 'ISBN of the book (optional)' })
  @IsOptional()
  @IsString()
  isbn?: string;
}

export class DuplicateCheckDto {
  @ApiProperty({ type: String, description: 'Title of the book' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ type: String, description: 'ISBN to check for duplicates' })
  @IsString()
  @IsNotEmpty()
  isbn!: string;
}
