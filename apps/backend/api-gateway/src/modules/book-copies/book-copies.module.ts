import { Module } from '@nestjs/common';
import { BookCopiesController } from './book-copies.controller';
import { BookCopiesClient } from './book-copies.client';

@Module({
  controllers: [BookCopiesController],
  providers: [BookCopiesClient],
})
export class BookCopiesModule {}
