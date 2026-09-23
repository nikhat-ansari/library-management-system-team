import { Module } from '@nestjs/common';
import { BooksClient } from './books.client';
import { BooksController } from './books.controller';

@Module({
  controllers: [BooksController],
  providers: [BooksClient],
})
export class BooksModule {}
