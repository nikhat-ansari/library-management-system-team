import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, type BookDocument } from './schemas/book.schema';
import { BookCopy, type BookCopyDocument } from './schemas/book-copy.schema';
import { Loan, type LoanDocument } from './schemas/loan.schema';
import { Reservation, type ReservationDocument } from './schemas/reservation.schema';
import { Seat, type SeatDocument } from './schemas/seat.schema';
import { SeatBooking, type SeatBookingDocument } from './schemas/seat-booking.schema';
import { DASHBOARD_LIST_LIMIT, type LibraryDayRange } from './librarian-dashboard.types';
import type { LibrarianDashboardResponse } from './dto/librarian-dashboard-response.dto';

type LoanRow = LibrarianDashboardResponse['dueToday']['loans'][number];
type ReservationRow = LibrarianDashboardResponse['pendingReservations']['reservations'][number];
type SeatBookingRow = LibrarianDashboardResponse['seatBookings']['bookings'][number];

@Injectable()
export class LibrarianDashboardDataService {
  private readonly logger = new Logger(LibrarianDashboardDataService.name);
  
  constructor(
    @InjectModel(Book.name, 'dashboard') private readonly bookModel: Model<BookDocument>,
    @InjectModel(BookCopy.name, 'dashboard') private readonly bookCopyModel: Model<BookCopyDocument>,
    @InjectModel(Loan.name, 'dashboard') private readonly loanModel: Model<LoanDocument>,
    @InjectModel(Reservation.name, 'dashboard') private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Seat.name, 'dashboard') private readonly seatModel: Model<SeatDocument>,
    @InjectModel(SeatBooking.name, 'dashboard') private readonly seatBookingModel: Model<SeatBookingDocument>,
  ) {}

  async read(day: LibraryDayRange): Promise<Pick<LibrarianDashboardResponse, 'dueToday' | 'overdue' | 'pendingReservations' | 'seatBookings'>> {
    const [dueToday, overdue, pendingReservations, seatBookings] = await Promise.all([
      this.loanSection({ status: 'ACTIVE', dueDate: { $gte: day.startsAt, $lt: day.endsAt } }, { dueDate: 1, _id: 1 }),
      this.loanSection({ status: 'ACTIVE', dueDate: { $lt: day.startsAt } }, { dueDate: 1, _id: 1 }),
      this.reservationSection(),
      this.seatBookingSection(day),
    ]);
    return { dueToday, overdue, pendingReservations, seatBookings };
  }

  private async loanSection(filter: Record<string, unknown>, sort: Record<string, 1>): Promise<LibrarianDashboardResponse['dueToday']> {
    const [count, loans] = await Promise.all([
      this.loanModel.countDocuments(filter).exec(),
      this.loanModel.find(filter).sort(sort).limit(DASHBOARD_LIST_LIMIT + 1).lean().exec(),
    ]);
    const visible = loans.slice(0, DASHBOARD_LIST_LIMIT);
    const bookIds = [...new Set(visible.map((loan) => loan.bookId.toString()))];
    const copyIds = [...new Set(visible.map((loan) => loan.copyId.toString()))];
    const [books, copies] = await Promise.all([
      this.bookModel.find({ _id: { $in: bookIds } }).select('title').lean().exec(),
      this.bookCopyModel.find({ _id: { $in: copyIds } }).select('accessionNumber').lean().exec(),
    ]);
    const titles = new Map(books.map((book) => [book._id.toString(), book.title]));
    const accessionNumbers = new Map(copies.map((copy) => [copy._id.toString(), copy.accessionNumber]));
    const rows: LoanRow[] = visible.map((loan) => ({
      id: loan._id.toString(), bookId: loan.bookId.toString(), copyId: loan.copyId.toString(), memberId: loan.memberId,
      dueDate: loan.dueDate.toISOString(), bookTitle: titles.get(loan.bookId.toString()), accessionNumber: accessionNumbers.get(loan.copyId.toString()),
    }));
    return { count, loans: rows, hasMore: loans.length > DASHBOARD_LIST_LIMIT };
  }

  private async reservationSection(): Promise<LibrarianDashboardResponse['pendingReservations']> {
    const filter = { status: 'PENDING' };
    const [count, reservations] = await Promise.all([
      this.reservationModel.countDocuments(filter).exec(),
      this.reservationModel.find(filter).sort({ requestedAt: 1, _id: 1 }).limit(DASHBOARD_LIST_LIMIT + 1).lean().exec(),
    ]);
    const visible = reservations.slice(0, DASHBOARD_LIST_LIMIT);
    const books = await this.bookModel.find({ _id: { $in: [...new Set(visible.map((item) => item.bookId.toString()))] } }).select('title').lean().exec();
    const titles = new Map(books.map((book) => [book._id.toString(), book.title]));
    const rows: ReservationRow[] = visible.map((reservation) => ({
      id: reservation._id.toString(), bookId: reservation.bookId.toString(), memberId: reservation.memberId, status: 'PENDING', requestedAt: reservation.requestedAt.toISOString(),
      queuePosition: reservation.queuePosition, pickupExpiresAt: reservation.pickupExpiresAt?.toISOString(), bookTitle: titles.get(reservation.bookId.toString()),
    }));
    return { count, reservations: rows, hasMore: reservations.length > DASHBOARD_LIST_LIMIT };
  }

  private async seatBookingSection(day: LibraryDayRange): Promise<LibrarianDashboardResponse['seatBookings']> {
    const filter = { status: { $ne: 'CANCELLED' }, startAt: { $gte: day.startsAt, $lt: day.endsAt } };
    const [count, bookings] = await Promise.all([
      this.seatBookingModel.countDocuments(filter).exec(),
      this.seatBookingModel.find(filter).sort({ startAt: 1, _id: 1 }).limit(DASHBOARD_LIST_LIMIT + 1).lean().exec(),
    ]);
    const visible = bookings.slice(0, DASHBOARD_LIST_LIMIT);
    const seats = await this.seatModel.find({ _id: { $in: [...new Set(visible.map((booking) => booking.seatId.toString()))] } }).select('seatNumber seatType').lean().exec();
    const seatById = new Map(seats.map((seat) => [seat._id.toString(), seat]));
    const rows: SeatBookingRow[] = visible.map((booking) => {
      const seat = seatById.get(booking.seatId.toString());
      return { id: booking._id.toString(), seatId: booking.seatId.toString(), memberId: booking.memberId, status: booking.status as 'CONFIRMED' | 'COMPLETED', startAt: booking.startAt.toISOString(), endAt: booking.endAt.toISOString(), seatNumber: seat?.seatNumber, seatType: seat?.seatType };
    });
    return { count, bookings: rows, hasMore: bookings.length > DASHBOARD_LIST_LIMIT };
  }
}
