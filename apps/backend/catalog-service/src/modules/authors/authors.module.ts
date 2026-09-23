import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Author, AuthorSchema } from './schemas/author.schema';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Author.name, schema: AuthorSchema }])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
