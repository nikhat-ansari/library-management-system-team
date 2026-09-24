import { Module } from '@nestjs/common';
import { CirculationController } from './circulation.controller';
import { FinesController } from './fines.controller';
import { CirculationClient } from './circulation.client';

@Module({
  controllers: [CirculationController, FinesController],
  providers: [CirculationClient],
})
export class CirculationModule {}
