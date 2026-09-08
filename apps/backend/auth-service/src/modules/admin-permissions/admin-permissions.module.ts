import { Module } from '@nestjs/common'; import { AuthModule } from '../auth/auth.module'; import { AdminPermissionsController } from './admin-permissions.controller'; import { AdminPermissionsService } from './admin-permissions.service';
@Module({ imports: [AuthModule], controllers: [AdminPermissionsController], providers: [AdminPermissionsService] }) export class AdminPermissionsModule {}
