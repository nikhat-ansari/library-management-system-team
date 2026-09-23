import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { LibrarianDashboardController } from './librarian-dashboard.controller';

test('Module 9 dashboard is declared for Librarian/Staff users only', () => {
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, LibrarianDashboardController), ['LIBRARIAN_STAFF']);
});
