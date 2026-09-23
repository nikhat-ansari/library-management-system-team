import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersClient } from './users.client';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersClient],
})
export class UsersModule {}
