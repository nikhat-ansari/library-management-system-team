import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string>(REQUIRED_PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!required) return true;
    const user = context.switchToHttp().getRequest().user as { role?: string; permissions?: string[] } | undefined;
    if (user?.role === 'ADMIN') return true;
    if (user?.role !== 'LIBRARIAN_STAFF' || !user.permissions?.includes(required)) throw new ForbiddenException('Required operational permission is not assigned');
    return true;
  }
}
