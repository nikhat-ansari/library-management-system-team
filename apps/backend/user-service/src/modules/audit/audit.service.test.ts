import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { AuditService } from './audit.service';

test('audit entries are server-timestamped and centrally redact sensitive summary fields', async () => {
  let persisted: Record<string, unknown> | undefined;
  const service = new AuditService({ create: async (value: Record<string, unknown>) => { persisted = value; } } as any, {} as any);
  await service.create({
    actorId: 'admin-1', action: 'USER_CREATED', module: 'USER_MANAGEMENT', recordReference: { id: 'staff-1', type: 'USER' },
    newChangeSummary: { name: 'Staff User', passwordHash: 'never-store', accessToken: 'never-store', apiKey: 'never-store', enabled: true, nested: { refreshToken: 'never-store', value: 'kept' }, entries: [{ authorization: 'never-store', visible: 'kept' }] },
  });
  assert.ok(persisted?.timestamp instanceof Date);
  assert.equal(persisted?.actorId, 'admin-1');
  assert.deepEqual(persisted?.newChangeSummary, { name: 'Staff User', enabled: true, nested: { value: 'kept' }, entries: [{ visible: 'kept' }] });
});

test('audit service has no normal update or delete operation', () => {
  assert.equal('update' in AuditService.prototype, false);
  assert.equal('delete' in AuditService.prototype, false);
});

test('audit history applies validated filters and uses deterministic newest-first pagination', async () => {
  let filter: Record<string, unknown> | undefined;
  let sort: Record<string, unknown> | undefined;
  let skip: number | undefined;
  let limit: number | undefined;
  const auditModel = {
    find: (value: Record<string, unknown>) => {
      filter = value;
      return { sort: (value: Record<string, unknown>) => { sort = value; return { skip: (value: number) => { skip = value; return { limit: (value: number) => { limit = value; return { lean: () => ({ exec: async () => [{ _id: { toString: () => 'audit-1' }, actorId: 'admin-1', action: 'USER_UPDATED', module: 'USER_MANAGEMENT', recordReference: { id: 'staff-1', type: 'USER' }, timestamp: new Date('2026-01-02T00:00:00.000Z'), oldChangeSummary: { name: 'Before' }, newChangeSummary: { name: 'After' } }] }) }; } }; } }; } };
    },
    countDocuments: () => ({ exec: async () => 21 }),
  };
  const users = { find: () => ({ select: () => ({ lean: () => ({ exec: async () => [{ _id: { toString: () => 'admin-1' }, name: 'Admin', email: 'admin@example.com' }] }) }) }) };
  const service = new AuditService(auditModel as any, users as any);
  const result = await service.list({ page: 2, limit: 10, action: 'USER_UPDATED', module: 'USER_MANAGEMENT', actorId: 'admin-1', recordReference: 'staff-1', from: '2026-01-01T00:00:00.000Z', to: '2026-01-31T23:59:59.999Z' });
  assert.deepEqual(sort, { timestamp: -1, _id: -1 });
  assert.equal(skip, 10); assert.equal(limit, 10);
  assert.equal(filter?.action, 'USER_UPDATED'); assert.equal(filter?.module, 'USER_MANAGEMENT'); assert.equal(filter?.actorId, 'admin-1'); assert.equal(filter?.['recordReference.id'], 'staff-1');
  assert.deepEqual(result.meta, { page: 2, limit: 10, total: 21, totalPages: 3 });
  assert.deepEqual(result.data[0], { id: 'audit-1', actor: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' }, action: 'USER_UPDATED', module: 'USER_MANAGEMENT', recordReference: { id: 'staff-1', type: 'USER' }, timestamp: new Date('2026-01-02T00:00:00.000Z'), oldChangeSummary: { name: 'Before' }, newChangeSummary: { name: 'After' } });
});
