import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  name!: string;

  @IsEnum(['ADMIN', 'STAFF', 'MEMBER'])
  role!: string;

  @IsOptional()
  @IsEnum(['STUDENT', 'TEACHER', 'FACULTY', 'EMPLOYEE', 'GENERAL'])
  memberType?: string;
}
