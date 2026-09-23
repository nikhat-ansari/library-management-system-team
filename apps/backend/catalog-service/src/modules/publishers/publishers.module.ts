import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Publisher, PublisherSchema } from './schemas/publisher.schema';
import { PublishersController } from './publishers.controller';
import { PublishersService } from './publishers.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Publisher.name, schema: PublisherSchema }])],
  controllers: [PublishersController],
  providers: [PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}
