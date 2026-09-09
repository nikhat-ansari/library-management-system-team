import { Module } from '@nestjs/common';
import { AdminUsersClient } from './admin-users.client';
import { AdminUsersController } from './admin-users.controller';
@Module({ controllers: [AdminUsersController], providers: [AdminUsersClient] })
export class AdminUsersModule {}
