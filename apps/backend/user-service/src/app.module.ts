import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'node:path';
import databaseConfig from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuditModule } from './modules/audit/audit.module';

@Controller('health')
class HealthController {
  @Get()
  status() { return { status: 'ok', service: process.env.SERVICE_NAME ?? 'user-service' }; }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: resolve(__dirname, '../../../..', '.env'), load: [databaseConfig] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI') }),
    }),
    UsersModule, SettingsModule, AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

