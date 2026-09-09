import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const STAFF_ROLE = 'LIBRARIAN_STAFF' as const;
export const ACCOUNT_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export class CreateAdminUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: [STAFF_ROLE], example: STAFF_ROLE })
  @IsEnum([STAFF_ROLE])
  role!: typeof STAFF_ROLE;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: [STAFF_ROLE], example: STAFF_ROLE })
  @IsOptional()
  @IsEnum([STAFF_ROLE])
  role?: typeof STAFF_ROLE;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ACCOUNT_STATUSES, example: 'INACTIVE' })
  @IsEnum(ACCOUNT_STATUSES)
  status!: (typeof ACCOUNT_STATUSES)[number];
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
