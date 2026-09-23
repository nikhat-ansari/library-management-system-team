import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Book, type BookDocument } from './schemas/book.schema';
import { BookCopy, type BookCopyDocument } from './schemas/book-copy.schema';
import { Loan, type LoanDocument } from './schemas/loan.schema';
import { Reservation, type ReservationDocument } from './schemas/reservation.schema';
import { Seat, type SeatDocument } from './schemas/seat.schema';
import { SeatBooking, type SeatBookingDocument } from './schemas/seat-booking.schema';

@ApiTags('Librarian Operations (Module 9 Seeding)')
@Controller('librarian/operations')
@UseGuards(JwtGuard, RolesGuard)
@Roles('LIBRARIAN_STAFF', 'ADMIN')
@ApiBearerAuth()
export class LibrarianOperationsController {
  constructor(
    @InjectModel(Book.name, 'dashboard') private readonly bookModel: Model<BookDocument>,
    @InjectModel(BookCopy.name, 'dashboard') private readonly bookCopyModel: Model<BookCopyDocument>,
    @InjectModel(Loan.name, 'dashboard') private readonly loanModel: Model<LoanDocument>,
    @InjectModel(Reservation.name, 'dashboard') private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Seat.name, 'dashboard') private readonly seatModel: Model<SeatDocument>,
    @InjectModel(SeatBooking.name, 'dashboard') private readonly seatBookingModel: Model<SeatBookingDocument>,
  ) {}

  @Post('books')
  @ApiOperation({ summary: 'Create a book and a copy' })
  async createBook(@Body() dto: { title: string; isbn: string; accessionNumber: string }) {
    const book = await this.bookModel.create({ title: dto.title, isbn: dto.isbn });
    const copy = await this.bookCopyModel.create({ bookId: book._id, accessionNumber: dto.accessionNumber });
    return { bookId: book._id.toString(), copyId: copy._id.toString() };
  }

  @Post('seats')
  @ApiOperation({ summary: 'Create a seat' })
  async createSeat(@Body() dto: { seatNumber: string; seatType: 'AC' | 'NON_AC' }) {
    const seat = await this.seatModel.create(dto);
    return { seatId: seat._id.toString() };
  }

  @Post('loans')
  @ApiOperation({ summary: 'Issue a loan' })
  async createLoan(@Body() dto: { bookId: string; copyId: string; memberId: string; dueDate: string }) {
    if (!Types.ObjectId.isValid(dto.bookId) || !Types.ObjectId.isValid(dto.copyId)) {
      throw new HttpException('Invalid ObjectId', HttpStatus.BAD_REQUEST);
    }
    const loan = await this.loanModel.create({
      bookId: new Types.ObjectId(dto.bookId),
      copyId: new Types.ObjectId(dto.copyId),
      memberId: dto.memberId,
      status: 'ACTIVE',
      dueDate: new Date(dto.dueDate),
    });
    return { loanId: loan._id.toString() };
  }

  @Post('reservations')
  @ApiOperation({ summary: 'Create a reservation' })
  async createReservation(@Body() dto: { bookId: string; memberId: string }) {
    if (!Types.ObjectId.isValid(dto.bookId)) {
      throw new HttpException('Invalid ObjectId', HttpStatus.BAD_REQUEST);
    }
    const reservation = await this.reservationModel.create({
      bookId: new Types.ObjectId(dto.bookId),
      memberId: dto.memberId,
      status: 'PENDING',
      requestedAt: new Date(),
    });
    return { reservationId: reservation._id.toString() };
  }

  @Post('seat-bookings')
  @ApiOperation({ summary: 'Create a seat booking' })
  async createSeatBooking(@Body() dto: { seatId: string; memberId: string; startAt: string; endAt: string }) {
    if (!Types.ObjectId.isValid(dto.seatId)) {
      throw new HttpException('Invalid ObjectId', HttpStatus.BAD_REQUEST);
    }
    const booking = await this.seatBookingModel.create({
      seatId: new Types.ObjectId(dto.seatId),
      memberId: dto.memberId,
      status: 'CONFIRMED',
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
    });
    return { bookingId: booking._id.toString() };
  }
}
