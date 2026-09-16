import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Holiday, HolidayDocument } from '../../schemas/holiday.schema';
import { SystemSettings, SystemSettingsDocument } from '../../schemas/system-settings.schema';
import { CreateHolidayDto } from './dto/holiday.dto';
import { UpdateSystemSettingsDto } from './dto/settings.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(SystemSettings.name) private readonly settings: Model<SystemSettingsDocument>, @InjectModel(Holiday.name) private readonly holidays: Model<HolidayDocument>, private readonly audit: AuditService) {}
  async getSettings() { const value = await this.settings.findOne({ key: 'library' }).lean().exec(); return value ? this.settingsResponse(value) : null; }
  async updateSettings(dto: UpdateSystemSettingsDto, actorId: string) {
    const old = await this.settings.findOne({ key: 'library' }).lean().exec();
    const value = await this.settings.findOneAndUpdate({ key: 'library' }, { $set: dto, $setOnInsert: { key: 'library' } }, { upsert: true, new: true, runValidators: true }).lean().exec();
    const fields = ['loanPeriod', 'borrowingLimit', 'fineRate', 'fineCap'] as const;
    const oldSummary = Object.fromEntries(fields.filter((field) => old?.[field] !== value[field]).map((field) => [field, old?.[field] ?? null]));
    const newSummary = Object.fromEntries(fields.filter((field) => old?.[field] !== value[field]).map((field) => [field, value[field]]));
    await this.audit.create({ actorId, action: 'SYSTEM_SETTINGS_UPDATED', module: 'SYSTEM_SETTINGS', recordReference: { id: value._id.toString(), type: 'SYSTEM_SETTINGS' }, oldChangeSummary: oldSummary, newChangeSummary: newSummary });
    return this.settingsResponse(value);
  }
  async listHolidays() { const values = await this.holidays.find().sort({ date: 1 }).lean().exec(); return { holidays: values.map((value) => ({ id: value._id.toString(), date: value.date })) }; }
  async addHoliday(dto: CreateHolidayDto, actorId: string) { if (!this.isCalendarDate(dto.date)) throw new ConflictException('Invalid holiday date'); try { const value = await this.holidays.create({ date: dto.date }); await this.audit.create({ actorId, action: 'HOLIDAY_CREATED', module: 'HOLIDAY_CALENDAR', recordReference: { id: value._id.toString(), type: 'HOLIDAY' }, newChangeSummary: { date: value.date } }); return { id: value._id.toString(), date: value.date }; } catch (error: any) { if (error?.code === 11000) throw new ConflictException('Holiday date already exists'); throw error; } }
  async removeHoliday(id: string, actorId: string) { if (!isValidObjectId(id)) throw new NotFoundException('Holiday not found'); const result = await this.holidays.findByIdAndDelete(id).exec(); if (!result) throw new NotFoundException('Holiday not found'); await this.audit.create({ actorId, action: 'HOLIDAY_DELETED', module: 'HOLIDAY_CALENDAR', recordReference: { id, type: 'HOLIDAY' }, oldChangeSummary: { date: result.date }, newChangeSummary: null }); return { message: 'Holiday removed' }; }
  private settingsResponse(value: any) { return { loanPeriod: value.loanPeriod, borrowingLimit: value.borrowingLimit, fineRate: value.fineRate, fineCap: value.fineCap }; }
  private isCalendarDate(date: string) { const [year, month, day] = date.split('-').map(Number); const parsed = new Date(Date.UTC(year, month - 1, day)); return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day; }
}
