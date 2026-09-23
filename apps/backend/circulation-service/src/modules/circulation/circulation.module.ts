import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CirculationController } from './circulation.controller';
import { CirculationService } from './circulation.service';
import { UserServiceClient } from './user-service.client';
import { CatalogServiceClient } from './catalog-service.client';
import { Transaction, TransactionSchema } from '../../schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
  ],
  controllers: [CirculationController],
  providers: [CirculationService, UserServiceClient, CatalogServiceClient],
  exports: [CirculationService],
})
export class CirculationModule {}
