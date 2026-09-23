export type LibrarianDashboardResponse = {
  libraryDate: string;
  timeZone: 'Asia/Kolkata';
  dueToday: {
    count: number;
    loans: Array<{
      id: string;
      bookId: string;
      copyId: string;
      memberId: string;
      dueDate: string;
      bookTitle?: string;
      accessionNumber?: string;
    }>;
    hasMore: boolean;
  };
  overdue: {
    count: number;
    loans: Array<{
      id: string;
      bookId: string;
      copyId: string;
      memberId: string;
      dueDate: string;
      bookTitle?: string;
      accessionNumber?: string;
    }>;
    hasMore: boolean;
  };
  pendingReservations: {
    count: number;
    reservations: Array<{
      id: string;
      bookId: string;
      memberId: string;
      status: 'PENDING';
      requestedAt: string;
      queuePosition?: number;
      pickupExpiresAt?: string;
      bookTitle?: string;
    }>;
    hasMore: boolean;
  };
  seatBookings: {
    count: number;
    bookings: Array<{
      id: string;
      seatId: string;
      memberId: string;
      status: 'CONFIRMED' | 'COMPLETED';
      startAt: string;
      endAt: string;
      seatNumber?: string;
      seatType?: 'AC' | 'NON_AC';
    }>;
    hasMore: boolean;
  };
  dailyPriorityInsight: {
    status: 'disabled' | 'settings_unavailable' | 'not_configured';
    content: string | null;
  };
};
