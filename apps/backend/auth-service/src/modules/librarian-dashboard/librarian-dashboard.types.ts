export const LIBRARY_TIME_ZONE = 'Asia/Kolkata' as const;
export const DASHBOARD_LIST_LIMIT = 25;

export const COPY_STATUSES = ['AVAILABLE', 'ISSUED', 'RESERVED', 'LOST', 'DAMAGED', 'MAINTENANCE', 'ARCHIVED'] as const;
export type CopyStatus = (typeof COPY_STATUSES)[number];

export const LOAN_STATUSES = ['ACTIVE', 'RETURNED', 'CLOSED', 'LOST', 'DAMAGED'] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const RESERVATION_STATUSES = ['PENDING', 'READY_FOR_PICKUP', 'FULFILLED', 'CANCELLED', 'EXPIRED'] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const SEAT_STATUSES = ['AVAILABLE', 'MAINTENANCE', 'DISABLED'] as const;
export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const SEAT_BOOKING_STATUSES = ['CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;
export type SeatBookingStatus = (typeof SEAT_BOOKING_STATUSES)[number];

export interface LibraryDayRange {
  date: string;
  startsAt: Date;
  endsAt: Date;
}

/** Asia/Kolkata is UTC+05:30 year-round and does not observe daylight saving time. */
export function libraryDayRange(now = new Date()): LibraryDayRange {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: LIBRARY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const startsAt = new Date(Date.UTC(year, month - 1, day, -5, -30));
  const endsAt = new Date(Date.UTC(year, month - 1, day + 1, -5, -30));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, startsAt, endsAt };
}
