import { Controller, Get, Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CirculationModule } from './modules/circulation/circulation.module';
import { resolve } from 'node:path';

@Controller('health')
class HealthController {
  @Get()
  status() { return { status: 'ok', service: process.env.SERVICE_NAME ?? 'circulation-service' }; }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: resolve(__dirname, '../../../..', '.env') }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI') }),
    }),
    CirculationModule,
  ],
  controllers: [HealthController]
})
export class AppModule {}

