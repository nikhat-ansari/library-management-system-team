import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';
/** Marks an operational route as requiring the named staff capability. ADMIN bypasses this check. */
export const RequirePermission = (permission: string) => SetMetadata(REQUIRED_PERMISSION_KEY, permission);
