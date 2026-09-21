import * as assert from 'node:assert/strict';
import { ServiceUnavailableException } from '@nestjs/common';
import { test } from 'node:test';
import { AiAdminReportsController } from '../admin-reports/admin-reports.controller';
import { AiReportSummaryDto } from '../admin-reports/dto/report-query.dto';

test('AI-disabled state stops the existing AI endpoint before an AI provider path', async () => {
  let checked = false;
  const controller = new AiAdminReportsController({ assertEnabled: async () => { checked = true; throw new ServiceUnavailableException({ available: false, reason: 'disabled' }); } } as never);
  await assert.rejects(() => controller.summary(Object.assign(new AiReportSummaryDto(), { reportType: 'members' })), (error: unknown) => error instanceof ServiceUnavailableException && error.getResponse() instanceof Object && (error.getResponse() as { reason: string }).reason === 'disabled');
  assert.equal(checked, true);
});

test('enabled state still returns the existing controlled unavailable response when no provider is configured', async () => {
  const controller = new AiAdminReportsController({ assertEnabled: async () => undefined } as never);
  await assert.rejects(() => controller.summary(Object.assign(new AiReportSummaryDto(), { reportType: 'members' })), (error: unknown) => error instanceof ServiceUnavailableException && error.getResponse() instanceof Object && (error.getResponse() as { reason: string }).reason === 'not_configured');
});
