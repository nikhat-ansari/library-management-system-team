import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LoanSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() bookId!: string;
  @ApiProperty() copyId!: string;
  @ApiProperty() memberId!: string;
  @ApiProperty({ format: 'date-time' }) dueDate!: string;
  @ApiPropertyOptional() bookTitle?: string;
  @ApiPropertyOptional() accessionNumber?: string;
}

class LoanSectionDto {
  @ApiProperty() count!: number;
  @ApiProperty({ type: [LoanSummaryDto] }) loans!: LoanSummaryDto[];
  @ApiProperty() hasMore!: boolean;
}

class ReservationSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() bookId!: string;
  @ApiProperty() memberId!: string;
  @ApiProperty({ enum: ['PENDING'] }) status!: 'PENDING';
  @ApiProperty({ format: 'date-time' }) requestedAt!: string;
  @ApiPropertyOptional() queuePosition?: number;
  @ApiPropertyOptional({ format: 'date-time' }) pickupExpiresAt?: string;
  @ApiPropertyOptional() bookTitle?: string;
}

class ReservationSectionDto {
  @ApiProperty() count!: number;
  @ApiProperty({ type: [ReservationSummaryDto] }) reservations!: ReservationSummaryDto[];
  @ApiProperty() hasMore!: boolean;
}

class SeatBookingSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() seatId!: string;
  @ApiProperty() memberId!: string;
  @ApiProperty({ enum: ['CONFIRMED', 'COMPLETED'] }) status!: 'CONFIRMED' | 'COMPLETED';
  @ApiProperty({ format: 'date-time' }) startAt!: string;
  @ApiProperty({ format: 'date-time' }) endAt!: string;
  @ApiPropertyOptional() seatNumber?: string;
  @ApiPropertyOptional({ enum: ['AC', 'NON_AC'] }) seatType?: 'AC' | 'NON_AC';
}

class SeatBookingSectionDto {
  @ApiProperty() count!: number;
  @ApiProperty({ type: [SeatBookingSummaryDto] }) bookings!: SeatBookingSummaryDto[];
  @ApiProperty() hasMore!: boolean;
}

class DailyPriorityInsightDto {
  @ApiProperty({ enum: ['disabled', 'settings_unavailable', 'not_configured'] }) status!: 'disabled' | 'settings_unavailable' | 'not_configured';
  @ApiProperty({ type: String, nullable: true }) content!: string | null;
}

export class LibrarianDashboardResponseDto {
  @ApiProperty({ example: '2026-09-21', description: 'Current library date in Asia/Kolkata.' }) libraryDate!: string;
  @ApiProperty({ example: 'Asia/Kolkata' }) timeZone!: 'Asia/Kolkata';
  @ApiProperty({ type: LoanSectionDto }) dueToday!: LoanSectionDto;
  @ApiProperty({ type: LoanSectionDto }) overdue!: LoanSectionDto;
  @ApiProperty({ type: ReservationSectionDto }) pendingReservations!: ReservationSectionDto;
  @ApiProperty({ type: SeatBookingSectionDto, description: 'Non-cancelled bookings whose startAt falls on libraryDate.' }) seatBookings!: SeatBookingSectionDto;
  @ApiProperty({ type: DailyPriorityInsightDto, nullable: true, description: 'Null content is intentional while no AI provider is configured.' }) dailyPriorityInsight!: DailyPriorityInsightDto;
}

export type LibrarianDashboardResponse = {
  libraryDate: string;
  timeZone: 'Asia/Kolkata';
  dueToday: { count: number; loans: Array<{ id: string; bookId: string; copyId: string; memberId: string; dueDate: string; bookTitle?: string; accessionNumber?: string }>; hasMore: boolean };
  overdue: { count: number; loans: Array<{ id: string; bookId: string; copyId: string; memberId: string; dueDate: string; bookTitle?: string; accessionNumber?: string }>; hasMore: boolean };
  pendingReservations: { count: number; reservations: Array<{ id: string; bookId: string; memberId: string; status: 'PENDING'; requestedAt: string; queuePosition?: number; pickupExpiresAt?: string; bookTitle?: string }>; hasMore: boolean };
  seatBookings: { count: number; bookings: Array<{ id: string; seatId: string; memberId: string; status: 'CONFIRMED' | 'COMPLETED'; startAt: string; endAt: string; seatNumber?: string; seatType?: 'AC' | 'NON_AC' }>; hasMore: boolean };
  dailyPriorityInsight: { status: 'disabled' | 'settings_unavailable' | 'not_configured'; content: string | null };
};
