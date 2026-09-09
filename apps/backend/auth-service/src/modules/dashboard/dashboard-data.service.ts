import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createConnection, type Connection } from 'mongoose';

export interface FineSummary { outstandingAmount: number; pendingPayments: number; }
export interface ReservationSummary { pending: number; readyForPickup: number; }
export interface SeatUtilization { occupied: number; total: number; percentage: number; }

export interface DashboardCounts {
  totalBooks: number;
  totalMembers: number;
  issuedBooks: number;
  overdueBooks: number;
  fineSummary: FineSummary;
  reservationSummary: ReservationSummary;
  seatUtilization: SeatUtilization;
}

const ISSUED_STATUSES = ['ISSUED', 'issued', 'ACTIVE', 'active', 'BORROWED', 'borrowed'];
const OUTSTANDING_FINE_STATUSES = ['PENDING', 'pending', 'UNPAID', 'unpaid', 'OVERDUE', 'overdue'];
const PENDING_RESERVATION_STATUSES = ['PENDING', 'pending'];
const READY_RESERVATION_STATUSES = ['READY_FOR_PICKUP', 'ready_for_pickup', 'READY', 'ready'];
const OCCUPIED_SEAT_STATUSES = ['OCCUPIED', 'occupied', 'IN_USE', 'in_use'];

/** Read-only adapter for the collections owned by the library modules. */
@Injectable()
export class DashboardDataService implements OnModuleDestroy {
  private connection?: Connection;

  async getDashboardCounts(): Promise<DashboardCounts> {
    const connection = await this.getConnection();
    if (!connection.db) throw new Error('Dashboard database connection is unavailable');

    const books = await this.collectionName('books') ?? 'books';
    const users = await this.collectionName('users') ?? 'users';
    const circulation = await this.collectionName('circulations', 'loans', 'transactions', 'borrowings') ?? 'circulations';
    const fines = await this.collectionName('fines') ?? 'fines';
    const reservations = await this.collectionName('reservations') ?? 'reservations';
    const seats = await this.collectionName('seats') ?? 'seats';
    const seatBookings = await this.collectionName('seatBookings', 'seat_bookings');

    const [totalBooks, totalMembers, issuedBooks, overdueBooks, fineSummary, reservationSummary, seatUtilization] = await Promise.all([
      connection.db.collection(books).countDocuments({}),
      connection.db.collection(users).countDocuments({ role: 'MEMBER' }),
      this.getIssuedCount(circulation),
      this.getOverdueCount(circulation),
      this.getFineSummary(fines),
      this.getReservationSummary(reservations),
      this.getSeatUtilization(seats, seatBookings),
    ]);
    return { totalBooks, totalMembers, issuedBooks, overdueBooks, fineSummary, reservationSummary, seatUtilization };
  }

  async onModuleDestroy(): Promise<void> { await this.connection?.close(); }

  private async getConnection(): Promise<Connection> {
    if (!this.connection) {
      // Do not override a database name embedded in the URI: it is the source
      // of truth for the application's existing collections.
      const uri = process.env.DASHBOARD_MONGODB_URI ?? process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lms-users';
      const database = process.env.DASHBOARD_DATABASE;
      this.connection = createConnection(uri, database ? { dbName: database } : undefined);
      await this.connection.asPromise();
    }
    return this.connection;
  }

  private async collectionName(...names: string[]): Promise<string | null> {
    const connection = await this.getConnection();
    if (!connection.db) return null;
    for (const name of names) {
      if (await connection.db.listCollections({ name }, { nameOnly: true }).hasNext()) return name;
    }
    return null;
  }

  private async getIssuedCount(collection: string): Promise<number> {
    return this.connection!.db!.collection(collection).countDocuments({ status: { $in: ISSUED_STATUSES } });
  }

  private async getOverdueCount(collection: string): Promise<number> {
    return this.connection!.db!.collection(collection).countDocuments({ status: { $in: ISSUED_STATUSES }, dueDate: { $lt: new Date() } });
  }

  private async getFineSummary(collection: string): Promise<FineSummary> {
    const outstanding = { $or: [{ status: { $in: OUTSTANDING_FINE_STATUSES } }, { paid: false }] };
    const [pendingPayments, amount] = await Promise.all([
      this.connection!.db!.collection(collection).countDocuments(outstanding),
      this.connection!.db!.collection(collection).aggregate<{ total: number }>([
        { $match: outstanding },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$remainingAmount', { $ifNull: ['$amount', 0] }] } } } },
      ]).toArray(),
    ]);
    return { outstandingAmount: amount[0]?.total ?? 0, pendingPayments };
  }

  private async getReservationSummary(collection: string): Promise<ReservationSummary> {
    const reservations = this.connection!.db!.collection(collection);
    const [pending, readyForPickup] = await Promise.all([
      reservations.countDocuments({ status: { $in: PENDING_RESERVATION_STATUSES } }),
      reservations.countDocuments({ status: { $in: READY_RESERVATION_STATUSES } }),
    ]);
    return { pending, readyForPickup };
  }

  private async getSeatUtilization(seatsCollection: string, seatBookingsCollection: string | null): Promise<SeatUtilization> {
    const seats = this.connection!.db!.collection(seatsCollection);
    const [total, occupiedSeats] = await Promise.all([
      seats.countDocuments({}),
      seats.countDocuments({ $or: [{ status: { $in: OCCUPIED_SEAT_STATUSES } }, { isOccupied: true }] }),
    ]);
    const occupied = occupiedSeats || !seatBookingsCollection
      ? occupiedSeats
      : await this.connection!.db!.collection(seatBookingsCollection).countDocuments({ status: { $in: OCCUPIED_SEAT_STATUSES } });
    return { occupied, total, percentage: total === 0 ? 0 : Number(((occupied / total) * 100).toFixed(2)) };
  }
}
