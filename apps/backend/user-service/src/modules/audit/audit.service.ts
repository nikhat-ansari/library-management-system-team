import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { AuditLog, AuditLogDocument, type AuditSummary, type AuditValue } from '../../schemas/audit-log.schema';
import { User, type UserDocument } from '../../schemas/user.schema';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

export type AuditAction = 'USER_CREATED' | 'USER_UPDATED' | 'USER_STATUS_CHANGED' | 'PERMISSIONS_CHANGED' | 'SYSTEM_SETTINGS_UPDATED' | 'HOLIDAY_CREATED' | 'HOLIDAY_DELETED';
export type AuditModule = 'USER_MANAGEMENT' | 'PERMISSIONS' | 'SYSTEM_SETTINGS' | 'HOLIDAY_CALENDAR';

export interface CreateAuditEntry {
  actorId: string;
  action: AuditAction;
  module: AuditModule;
  recordReference: { id: string; type: string };
  oldChangeSummary?: AuditSummary | null;
  newChangeSummary?: AuditSummary | null;
}

const SENSITIVE_KEY = /password|token|secret|credential|api[-_]?key|authorization|jwt/i;

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLogDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
  ) {}

  async create(entry: CreateAuditEntry): Promise<void> {
    await this.auditLogs.create({
      actorId: entry.actorId,
      action: entry.action,
      module: entry.module,
      recordReference: entry.recordReference,
      oldChangeSummary: this.sanitize(entry.oldChangeSummary ?? null),
      newChangeSummary: this.sanitize(entry.newChangeSummary ?? null),
      timestamp: new Date(),
    });
  }

  async list(query: AuditLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: FilterQuery<AuditLogDocument> = {};
    if (query.action) filter.action = query.action;
    if (query.module) filter.module = query.module;
    if (query.actorId) filter.actorId = query.actorId;
    if (query.recordReference) filter['recordReference.id'] = query.recordReference;
    if (query.from || query.to) {
      const timestamp: { $gte?: Date; $lte?: Date } = {};
      if (query.from) timestamp.$gte = this.dateAtStart(query.from, 'from');
      if (query.to) timestamp.$lte = this.dateAtEnd(query.to, 'to');
      if (timestamp.$gte && timestamp.$lte && timestamp.$gte > timestamp.$lte) throw new BadRequestException('from must be before or equal to to');
      filter.timestamp = timestamp;
    }
    if (query.search?.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const expression = new RegExp(escaped, 'i');
      filter.$or = [{ action: expression }, { module: expression }, { actorId: expression }, { 'recordReference.id': expression }, { 'recordReference.type': expression }];
    }
    const [records, total] = await Promise.all([
      this.auditLogs.find(filter).sort({ timestamp: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
      this.auditLogs.countDocuments(filter).exec(),
    ]);
    const actorIds = [...new Set(records.map((record) => record.actorId))];
    const actors = actorIds.length === 0 ? [] : await this.users.find({ _id: { $in: actorIds } }).select('name email').lean().exec();
    const byId = new Map(actors.map((actor) => [actor._id.toString(), { id: actor._id.toString(), name: actor.name, email: actor.email }]));
    return {
      data: records.map((record) => ({
        id: record._id.toString(), actor: byId.get(record.actorId) ?? { id: record.actorId, name: 'Unknown user', email: null }, action: record.action, module: record.module,
        recordReference: record.recordReference, timestamp: record.timestamp, oldChangeSummary: record.oldChangeSummary, newChangeSummary: record.newChangeSummary,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private sanitize(summary: AuditSummary | null): AuditSummary | null {
    if (!summary) return null;
    return Object.fromEntries(Object.entries(summary)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .map(([key, value]) => [key, this.sanitizeValue(value)]));
  }

  private sanitizeValue(value: AuditSummary[keyof AuditSummary]): AuditValue {
    if (Array.isArray(value)) return value.map((item) => this.sanitizeValue(item));
    if (value && typeof value === 'object') return this.sanitize(value as AuditSummary) ?? {};
    return value;
  }

  private dateAtStart(value: string, field: string): Date { const date = new Date(value); if (Number.isNaN(date.valueOf())) throw new BadRequestException(`${field} must be a valid ISO date`); return date; }
  private dateAtEnd(value: string, field: string): Date { const date = new Date(value); if (Number.isNaN(date.valueOf())) throw new BadRequestException(`${field} must be a valid ISO date`); return date; }
}
