import { Module } from '@nestjs/common';
import { CirculationController } from './circulation.controller';
import { CirculationClient } from './circulation.client';

@Module({
  controllers: [CirculationController],
  providers: [CirculationClient],
})
export class CirculationModule {}
