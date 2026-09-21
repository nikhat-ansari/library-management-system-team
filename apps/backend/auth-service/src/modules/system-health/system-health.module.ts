import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SystemHealthController } from './system-health.controller';
import { AiAvailabilityService } from './ai-availability.service';

@Module({ imports: [AuthModule], controllers: [SystemHealthController], providers: [AiAvailabilityService], exports: [AiAvailabilityService] })
export class SystemHealthModule {}
