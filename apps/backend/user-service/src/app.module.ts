import { Controller, Get, Module } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  status() { return { status: 'ok', service: process.env.SERVICE_NAME ?? 'user-service' }; }
}

@Module({ controllers: [HealthController] })
export class AppModule {}

