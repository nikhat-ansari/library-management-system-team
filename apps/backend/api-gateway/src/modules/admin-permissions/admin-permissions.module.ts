import { Module } from '@nestjs/common'; import { AdminPermissionsClient } from './admin-permissions.client'; import { AdminPermissionsController } from './admin-permissions.controller';
@Module({ controllers: [AdminPermissionsController], providers: [AdminPermissionsClient] }) export class AdminPermissionsModule {}
