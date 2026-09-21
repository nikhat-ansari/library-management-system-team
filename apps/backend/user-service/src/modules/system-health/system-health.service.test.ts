import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { validate } from 'class-validator';
import { SystemHealthService } from './system-health.service';
import { UpdateAiSettingsDto } from './dto/ai-settings.dto';

test('Module 8 persists AI settings atomically and audits an actual state change', async () => {
  let enabled = true;
  const audits: Record<string, unknown>[] = [];
  const settings = {
    findOne: () => ({ lean: () => ({ exec: async () => ({ _id: { toString: () => 'ai-settings' }, key: 'default', enabled }) }) }),
    findOneAndUpdate: (_filter: unknown, update: { $set?: { enabled: boolean } }) => ({ lean: () => ({ exec: async () => { if (update.$set) enabled = update.$set.enabled; return { _id: { toString: () => 'ai-settings' }, key: 'default', enabled }; } }) }),
  };
  const service = new SystemHealthService(settings as never, { aggregate: () => ({ exec: async () => [] }), create: async () => undefined } as never, { aggregate: () => ({ exec: async () => [] }) } as never, { create: async (entry: Record<string, unknown>) => { audits.push(entry); } } as never);
  assert.deepEqual(await service.updateAiSettings({ enabled: false }, 'admin-1'), { enabled: false });
  assert.equal(enabled, false);
  assert.equal(audits.length, 1);
  assert.deepEqual(audits[0].newChangeSummary, { enabled: false });
});

test('Module 8 aggregates only persisted health and feedback records', async () => {
  const settings = { findOneAndUpdate: () => ({ lean: () => ({ exec: async () => ({ enabled: false }) }) }) };
  const events = { aggregate: () => ({ exec: async () => [{ _id: 'API_ERROR', count: 2 }, { _id: 'NOTIFICATION_FAILURE', count: 3 }, { _id: 'AI_FAILURE', count: 4 }, { _id: 'AI_TIMEOUT', count: 1 }, { _id: 'AI_FALLBACK', count: 5 }, { _id: 'AI_SUCCESS', count: 8 }] }) };
  const feedback = { aggregate: () => ({ exec: async () => [{ _id: 'HELPFUL', count: 7 }, { _id: 'NOT_HELPFUL', count: 2 }] }) };
  const service = new SystemHealthService(settings as never, events as never, feedback as never, {} as never);
  assert.deepEqual(await service.getSystemHealth(), { retentionDays: 90, application: { apiErrors: 2 }, notifications: { deliveryFailures: 3 }, ai: { enabled: false, usage: 8, errors: 5, providerFailures: 4, timeouts: 1, unavailable: 0, fallbackUsed: 5 } });
  assert.deepEqual(await service.getAiFeedback(), { retentionDays: 365, helpful: 7, notHelpful: 2 });
});

test('Module 8 rejects non-boolean AI enablement values', async () => {
  assert.equal((await validate(Object.assign(new UpdateAiSettingsDto(), { enabled: false }))).length, 0);
  assert.ok((await validate(Object.assign(new UpdateAiSettingsDto(), { enabled: 'yes' }))).length > 0);
  assert.ok((await validate(Object.assign(new UpdateAiSettingsDto(), { enabled: 1 }))).length > 0);
});
