import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { SystemHealthController } from './system-health.controller';

test('Module 8 endpoints use the existing ADMIN RBAC metadata', () => {
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, SystemHealthController), ['ADMIN']);
});
