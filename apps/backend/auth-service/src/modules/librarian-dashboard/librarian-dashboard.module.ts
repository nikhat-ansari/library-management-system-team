import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemHealthModule } from '../system-health/system-health.module';
import { LibrarianDashboardController } from './librarian-dashboard.controller';
import { LibrarianDashboardDataService } from './librarian-dashboard-data.service';
import { LibrarianDashboardService } from './librarian-dashboard.service';
import { LibrarianOperationsController } from './librarian-operations.controller';
import { Book, BookSchema } from './schemas/book.schema';
import { BookCopy, BookCopySchema } from './schemas/book-copy.schema';
import { Loan, LoanSchema } from './schemas/loan.schema';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { Seat, SeatSchema } from './schemas/seat.schema';
import { SeatBooking, SeatBookingSchema } from './schemas/seat-booking.schema';

@Module({
  imports: [
    SystemHealthModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get('DASHBOARD_MONGODB_URI') ?? config.get('MONGODB_URI') ?? 'mongodb://localhost:27017/lms-users',
        dbName: config.get('DASHBOARD_DATABASE'),
      }),
      inject: [ConfigService],
      connectionName: 'dashboard',
    }),
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookCopy.name, schema: BookCopySchema },
      { name: Loan.name, schema: LoanSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Seat.name, schema: SeatSchema },
      { name: SeatBooking.name, schema: SeatBookingSchema },
    ], 'dashboard'),
  ],
  controllers: [LibrarianDashboardController, LibrarianOperationsController],
  providers: [LibrarianDashboardDataService, LibrarianDashboardService],
})
export class LibrarianDashboardModule {}
