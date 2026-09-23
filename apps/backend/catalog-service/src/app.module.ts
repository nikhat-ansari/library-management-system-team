import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'node:path';
import databaseConfig from './config/database.config';
import { BooksModule } from './modules/books/books.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { PublishersModule } from './modules/publishers/publishers.module';
import { BookCopiesModule } from './modules/book-copies/book-copies.module';

@Controller('health')
class HealthController {
  @Get()
  status() { return { status: 'ok', service: process.env.SERVICE_NAME ?? 'catalog-service' }; }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: resolve(__dirname, '../../../..', '.env'), load: [databaseConfig] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI') }),
    }),
    AuthModule,
    BooksModule,
    CategoriesModule,
    AuthorsModule,
    PublishersModule,
    BookCopiesModule,
  ],
  controllers: [HealthController]
})
export class AppModule {}
