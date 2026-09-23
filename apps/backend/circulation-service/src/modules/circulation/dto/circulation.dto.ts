import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class IssueBookDto {
  @IsNotEmpty()
  @IsMongoId()
  memberId!: string;

  @IsNotEmpty()
  @IsString()
  copyBarcode!: string;
}

export class ReturnBookDto {
  @IsNotEmpty()
  @IsString()
  copyBarcode!: string;

  @IsString()
  condition?: string; // LOST, DAMAGED, or undefined for normal
}

export class RenewBookDto {
  @IsNotEmpty()
  @IsMongoId()
  transactionId!: string;
}
