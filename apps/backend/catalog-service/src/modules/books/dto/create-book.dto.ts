import { IsString, IsNotEmpty, IsObject, IsOptional, IsEnum, IsNumber, Min, IsDateString, IsMongoId } from 'class-validator';
import { AcquisitionType } from '../schemas/book.schema';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcquisitionDto {
  @ApiProperty({ enum: AcquisitionType, description: 'Type of acquisition' })
  @IsEnum(AcquisitionType)
  @IsNotEmpty()
  type!: AcquisitionType;

  @ApiProperty({ type: String, format: 'date-time', description: 'Date of acquisition' })
  @IsDateString()
  @IsNotEmpty()
  acquisitionDate!: string;

  @ApiProperty({ type: Number, minimum: 0, description: 'Cost of the book' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost!: number;

  @ApiProperty({ type: String, description: 'Vendor or Source' })
  @IsString()
  @IsNotEmpty()
  vendorOrSource!: string;
}

export class CreateBookDto {
  @ApiProperty({ type: String, description: 'Title of the book' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ type: String, description: 'Unique ISBN of the book' })
  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @ApiProperty({ type: String, description: 'Mongo ID of Category' })
  @IsMongoId()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({ type: String, description: 'Mongo ID of Author' })
  @IsMongoId()
  @IsNotEmpty()
  authorId!: string;

  @ApiProperty({ type: String, description: 'Mongo ID of Publisher' })
  @IsMongoId()
  @IsNotEmpty()
  publisherId!: string;

  @ApiPropertyOptional({ type: Object, description: 'Optional metadata from catalog' })
  @IsObject()
  @IsOptional()
  catalogueMetadata?: Record<string, any>;

  @ApiProperty({ type: AcquisitionDto, description: 'Acquisition details' })
  @IsObject()
  @IsNotEmpty()
  @Type(() => AcquisitionDto)
  acquisition!: AcquisitionDto;
}
