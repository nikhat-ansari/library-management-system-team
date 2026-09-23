import { Module } from '@nestjs/common';
import { ReferenceDataClient } from './reference-data.client';
import { ReferenceDataController } from './reference-data.controller';

@Module({
  controllers: [ReferenceDataController],
  providers: [ReferenceDataClient],
})
export class ReferenceDataModule {}
