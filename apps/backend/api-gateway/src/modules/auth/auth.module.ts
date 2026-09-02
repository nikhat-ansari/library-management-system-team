import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthServiceClient } from './auth-service.client';

@Module({
  controllers: [AuthController],
  providers: [AuthServiceClient],
  exports: [AuthServiceClient],
})
export class AuthModule {}
