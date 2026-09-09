import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const STAFF_ROLE = 'LIBRARIAN_STAFF' as const;
const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export class CreateAdminUserDto {
  @ApiProperty({ example: 'John Doe' }) @IsString() @IsNotEmpty() name!: string;
  @ApiProperty({ example: 'john@example.com' }) @IsEmail() email!: string;
  @ApiProperty({ enum: [STAFF_ROLE] }) @IsEnum([STAFF_ROLE]) role!: typeof STAFF_ROLE;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ enum: [STAFF_ROLE] }) @IsOptional() @IsEnum([STAFF_ROLE]) role?: typeof STAFF_ROLE;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ACCOUNT_STATUSES }) @IsEnum(ACCOUNT_STATUSES) status!: (typeof ACCOUNT_STATUSES)[number];
}

export class AdminUserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: [STAFF_ROLE] }) role!: typeof STAFF_ROLE;
  @ApiProperty({ enum: ACCOUNT_STATUSES }) accountStatus!: (typeof ACCOUNT_STATUSES)[number];
  @ApiProperty({ enum: ACCOUNT_STATUSES }) status!: (typeof ACCOUNT_STATUSES)[number];
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
}
