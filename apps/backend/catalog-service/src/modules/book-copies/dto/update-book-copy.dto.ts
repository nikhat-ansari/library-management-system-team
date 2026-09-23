import { PartialType } from '@nestjs/swagger';
import { CreateBookCopyDto } from './create-book-copy.dto';

export class UpdateBookCopyDto extends PartialType(CreateBookCopyDto) {}
