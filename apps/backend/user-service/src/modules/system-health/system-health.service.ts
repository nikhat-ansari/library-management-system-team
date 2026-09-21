import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { AiFeedback, type AiFeedbackDocument } from '../../schemas/ai-feedback.schema';
import { AiSettings, type AiSettingsDocument } from '../../schemas/ai-settings.schema';
import { SystemHealthEvent, type SystemHealthEventDocument, type SystemHealthEventType } from '../../schemas/system-health-event.schema';
import { UpdateAiSettingsDto } from './dto/ai-settings.dto';

@Injectable()
export class SystemHealthService {
  constructor(
    @InjectModel(AiSettings.name) private readonly settings: Model<AiSettingsDocument>,
    @InjectModel(SystemHealthEvent.name) private readonly events: Model<SystemHealthEventDocument>,
    @InjectModel(AiFeedback.name) private readonly feedback: Model<AiFeedbackDocument>,
    private readonly audit: AuditService,
  ) {}

  async getAiSettings() { const value = await this.settings.findOneAndUpdate({ key: 'default' }, { $setOnInsert: { key: 'default', enabled: true } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean().exec(); return { enabled: value.enabled }; }

  async updateAiSettings(dto: UpdateAiSettingsDto, actorId: string) {
    const previous = await this.settings.findOne({ key: 'default' }).lean().exec();
    const value = await this.settings.findOneAndUpdate({ key: 'default' }, { $set: { enabled: dto.enabled }, $setOnInsert: { key: 'default' } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }).lean().exec();
    if (!previous || previous.enabled !== value.enabled) await this.audit.create({ actorId, action: 'AI_SETTINGS_UPDATED', module: 'AI_SETTINGS', recordReference: { id: value._id.toString(), type: 'AI_SETTINGS' }, oldChangeSummary: { enabled: previous?.enabled ?? null }, newChangeSummary: { enabled: value.enabled } });
    return { enabled: value.enabled };
  }

  async getSystemHealth() {
    const [settings, grouped] = await Promise.all([this.getAiSettings(), this.events.aggregate<{ _id: SystemHealthEventType; count: number }>([{ $group: { _id: '$type', count: { $sum: 1 } } }]).exec()]);
    const counts = new Map(grouped.map((value) => [value._id, value.count]));
    return {
      retentionDays: 90,
      application: { apiErrors: counts.get('API_ERROR') ?? 0 },
      notifications: { deliveryFailures: counts.get('NOTIFICATION_FAILURE') ?? 0 },
      ai: { enabled: settings.enabled, usage: counts.get('AI_SUCCESS') ?? 0, errors: (counts.get('AI_FAILURE') ?? 0) + (counts.get('AI_TIMEOUT') ?? 0) + (counts.get('AI_UNAVAILABLE') ?? 0), providerFailures: counts.get('AI_FAILURE') ?? 0, timeouts: counts.get('AI_TIMEOUT') ?? 0, unavailable: counts.get('AI_UNAVAILABLE') ?? 0, fallbackUsed: counts.get('AI_FALLBACK') ?? 0 },
    };
  }

  async getAiFeedback() {
    const grouped = await this.feedback.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$rating', count: { $sum: 1 } } }]).exec();
    const counts = new Map(grouped.map((value) => [value._id, value.count]));
    return { retentionDays: 365, helpful: counts.get('HELPFUL') ?? 0, notHelpful: counts.get('NOT_HELPFUL') ?? 0 };
  }

  async recordEvent(type: SystemHealthEventType, source: string, statusCode?: number): Promise<void> { await this.events.create({ type, source, statusCode, occurredAt: new Date() }); }
}
