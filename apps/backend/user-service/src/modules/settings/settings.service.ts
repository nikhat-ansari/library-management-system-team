import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Holiday, HolidayDocument } from '../../schemas/holiday.schema';
import { SystemSettings, SystemSettingsDocument } from '../../schemas/system-settings.schema';
import { CreateHolidayDto } from './dto/holiday.dto';
import { UpdateSystemSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(SystemSettings.name) private readonly settings: Model<SystemSettingsDocument>, @InjectModel(Holiday.name) private readonly holidays: Model<HolidayDocument>) {}
  async getSettings() { const value = await this.settings.findOne({ key: 'library' }).lean().exec(); return value ? this.settingsResponse(value) : null; }
  async updateSettings(dto: UpdateSystemSettingsDto) { const value = await this.settings.findOneAndUpdate({ key: 'library' }, { $set: dto, $setOnInsert: { key: 'library' } }, { upsert: true, new: true, runValidators: true }).lean().exec(); return this.settingsResponse(value); }
  async listHolidays() { const values = await this.holidays.find().sort({ date: 1 }).lean().exec(); return { holidays: values.map((value) => ({ id: value._id.toString(), date: value.date })) }; }
  async addHoliday(dto: CreateHolidayDto) { if (!this.isCalendarDate(dto.date)) throw new ConflictException('Invalid holiday date'); try { const value = await this.holidays.create({ date: dto.date }); return { id: value._id.toString(), date: value.date }; } catch (error: any) { if (error?.code === 11000) throw new ConflictException('Holiday date already exists'); throw error; } }
  async removeHoliday(id: string) { if (!isValidObjectId(id)) throw new NotFoundException('Holiday not found'); const result = await this.holidays.findByIdAndDelete(id).exec(); if (!result) throw new NotFoundException('Holiday not found'); return { message: 'Holiday removed' }; }
  private settingsResponse(value: any) { return { loanPeriod: value.loanPeriod, borrowingLimit: value.borrowingLimit, fineRate: value.fineRate, fineCap: value.fineCap }; }
  private isCalendarDate(date: string) { const [year, month, day] = date.split('-').map(Number); const parsed = new Date(Date.UTC(year, month - 1, day)); return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day; }
}
