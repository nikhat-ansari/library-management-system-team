import { BadRequestException, Injectable, OnModuleDestroy } from '@nestjs/common';
import { createConnection, type Connection } from 'mongoose';
import type { ReportQueryDto, ReportType } from './dto/report-query.dto';

export type ReportRow = Record<string, unknown>;
export interface ReportResult { reportType: ReportType; dateRange: { from?: string; to?: string }; filters: Record<string, string>; summary: Record<string, number>; rows: ReportRow[]; generatedAt: string; }

const ACTIVE_LOAN_STATUSES = ['ISSUED', 'issued', 'ACTIVE', 'active', 'BORROWED', 'borrowed'];
const COLLECTIONS: Record<ReportType, string[]> = { books: ['books'], circulation: ['circulations', 'loans', 'transactions', 'borrowings'], fines: ['fines'], members: ['users'], seats: ['seats', 'seatBookings', 'seat_bookings'] };

@Injectable()
export class ReportsDataService implements OnModuleDestroy {
  private connection?: Connection;

  async report(type: ReportType, query: ReportQueryDto): Promise<ReportResult> {
    this.validateRange(query);
    const db = (await this.getConnection()).db;
    if (!db) throw new Error('Reporting database connection is unavailable');
    const collectionName = await this.collectionName(COLLECTIONS[type]);
    if (!collectionName) return this.result(type, query, [], {});
    const match = this.match(type, query);
    const documents = await db.collection(collectionName).find(match).sort({ createdAt: -1, _id: -1 }).toArray();
    const rows = documents.map((document) => this.row(type, document as unknown as ReportRow));
    return this.result(type, query, rows, this.summary(type, rows));
  }

  async onModuleDestroy() { await this.connection?.close(); }

  private async getConnection() {
    if (!this.connection) {
      const uri = process.env.DASHBOARD_MONGODB_URI ?? process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lms-users';
      this.connection = createConnection(uri, process.env.DASHBOARD_DATABASE ? { dbName: process.env.DASHBOARD_DATABASE } : undefined);
      await this.connection.asPromise();
    }
    return this.connection;
  }

  private async collectionName(names: string[]) {
    const db = (await this.getConnection()).db!;
    for (const name of names) if (await db.listCollections({ name }, { nameOnly: true }).hasNext()) return name;
    return null;
  }

  private validateRange(query: ReportQueryDto) {
    if (query.dateFrom && query.dateTo && new Date(query.dateFrom) > new Date(query.dateTo)) throw new BadRequestException('dateFrom must not be later than dateTo');
  }

  private match(type: ReportType, query: ReportQueryDto): Record<string, unknown> {
    const match: Record<string, unknown> = {};
    if (type === 'members') match.role = 'MEMBER';
    if (query.status) match.status = query.status;
    if (query.category) match.category = query.category;
    if (query.memberType) match.memberType = query.memberType;
    if (query.seatType) match.seatType = query.seatType;
    if (query.dateFrom || query.dateTo) {
      const date: Record<string, Date> = {};
      if (query.dateFrom) date.$gte = new Date(`${query.dateFrom}T00:00:00.000Z`);
      if (query.dateTo) date.$lte = new Date(`${query.dateTo}T23:59:59.999Z`);
      match.createdAt = date;
    }
    return match;
  }

  private row(type: ReportType, value: ReportRow): ReportRow {
    const id = String(value._id ?? '');
    const common = { id, status: value.status, createdAt: value.createdAt, updatedAt: value.updatedAt };
    if (type === 'books') return { ...common, title: value.title, isbn: value.isbn, author: value.author, category: value.category, totalCopies: value.totalCopies, availableCopies: value.availableCopies };
    if (type === 'circulation') return { ...common, bookId: value.bookId, copyId: value.copyId, memberId: value.memberId, issuedAt: value.issuedAt, returnedAt: value.returnedAt, dueDate: value.dueDate, renewedAt: value.renewedAt };
    if (type === 'fines') return { ...common, memberId: value.memberId, loanId: value.loanId, amount: value.amount, remainingAmount: value.remainingAmount, paid: value.paid, paidAt: value.paidAt };
    if (type === 'members') return { ...common, name: value.name, email: value.email, memberType: value.memberType, lastLogin: value.lastLogin };
    return { ...common, seatNumber: value.seatNumber, seatType: value.seatType, isOccupied: value.isOccupied, bookingId: value.bookingId, startTime: value.startTime, endTime: value.endTime, price: value.price };
  }

  private summary(type: ReportType, rows: ReportRow[]) {
    const result: Record<string, number> = { total: rows.length };
    for (const row of rows) {
      const status = typeof row.status === 'string' ? row.status.toLowerCase() : 'unspecified';
      result[`status_${status}`] = (result[`status_${status}`] ?? 0) + 1;
      if (type === 'fines') result.totalAmount = (result.totalAmount ?? 0) + Number(row.remainingAmount ?? row.amount ?? 0);
      if (type === 'circulation' && ACTIVE_LOAN_STATUSES.includes(String(row.status)) && row.dueDate && new Date(String(row.dueDate)) < new Date()) result.overdue = (result.overdue ?? 0) + 1;
    }
    return result;
  }

  private result(type: ReportType, query: ReportQueryDto, rows: ReportRow[], summary: Record<string, number>): ReportResult {
    const filters = Object.fromEntries(Object.entries({ status: query.status, category: query.category, memberType: query.memberType, seatType: query.seatType }).filter(([, value]) => value !== undefined)) as Record<string, string>;
    return { reportType: type, dateRange: { from: query.dateFrom, to: query.dateTo }, filters, summary: { total: rows.length, ...summary }, rows, generatedAt: new Date().toISOString() };
  }
}
