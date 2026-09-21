import { Module } from '@nestjs/common';
import { SystemHealthController } from './system-health.controller';
@Module({ controllers: [SystemHealthController] })
export class SystemHealthModule {}
