const { MongoClient, ObjectId } = require('mongodb');

async function testQuery() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-users';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');

    const nowKolkata = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const kolkataYear = nowKolkata.getFullYear();
    const kolkataMonth = nowKolkata.getMonth();
    const kolkataDate = nowKolkata.getDate();
    
    // Convert back to YYYY-MM-DD
    const mm = String(kolkataMonth + 1).padStart(2, '0');
    const dd = String(kolkataDate).padStart(2, '0');
    const libraryDate = `${kolkataYear}-${mm}-${dd}`;

    // Boundaries in UTC that correspond to Asia/Kolkata midnight
    const startOfDay = new Date(Date.UTC(kolkataYear, kolkataMonth, kolkataDate, -5, -30, 0));
    const endOfDay = new Date(Date.UTC(kolkataYear, kolkataMonth, kolkataDate, 18, 29, 59, 999));

    console.log('Querying for Date:', libraryDate);
    console.log('Start of Day (UTC):', startOfDay.toISOString());
    console.log('End of Day (UTC):', endOfDay.toISOString());

    // 1. Due Today
    const dueTodayLoans = await db.collection('loans').aggregate([
      { $match: { status: 'ACTIVE', dueDate: { $gte: startOfDay, $lte: endOfDay } } },
      { $limit: 51 },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
    ]).toArray();

    // 2. Overdue
    const overdueLoans = await db.collection('loans').aggregate([
      { $match: { status: 'ACTIVE', dueDate: { $lt: startOfDay } } },
      { $limit: 51 },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
    ]).toArray();

    // 3. Pending Reservations
    const pendingRes = await db.collection('reservations').aggregate([
      { $match: { status: 'PENDING' } },
      { $sort: { requestedAt: 1 } },
      { $limit: 51 },
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
    ]).toArray();

    // 4. Seat Bookings for today
    const seatBookings = await db.collection('seat_bookings').aggregate([
      {
        $match: {
          status: { $in: ['CONFIRMED', 'COMPLETED'] },
          startAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $limit: 51 },
      {
        $lookup: {
          from: 'seats',
          localField: 'seatId',
          foreignField: '_id',
          as: 'seat',
        },
      },
      { $unwind: '$seat' },
    ]).toArray();

    const response = {
      libraryDate,
      timeZone: 'Asia/Kolkata',
      dueToday: {
        count: dueTodayLoans.length > 50 ? 50 : dueTodayLoans.length,
        loans: dueTodayLoans.slice(0, 50).map((l) => ({
          id: l._id,
          bookId: l.bookId,
          copyId: l.copyId,
          memberId: l.memberId,
          dueDate: l.dueDate,
          bookTitle: l.book.title,
        })),
        hasMore: dueTodayLoans.length > 50,
      },
      overdue: {
        count: overdueLoans.length > 50 ? 50 : overdueLoans.length,
        loans: overdueLoans.slice(0, 50).map((l) => ({
          id: l._id,
          bookId: l.bookId,
          copyId: l.copyId,
          memberId: l.memberId,
          dueDate: l.dueDate,
          bookTitle: l.book.title,
        })),
        hasMore: overdueLoans.length > 50,
      },
      pendingReservations: {
        count: pendingRes.length > 50 ? 50 : pendingRes.length,
        reservations: pendingRes.slice(0, 50).map((r, i) => ({
          id: r._id,
          bookId: r.bookId,
          memberId: r.memberId,
          status: r.status,
          requestedAt: r.requestedAt,
          queuePosition: i + 1,
          bookTitle: r.book.title,
        })),
        hasMore: pendingRes.length > 50,
      },
      seatBookings: {
        count: seatBookings.length > 50 ? 50 : seatBookings.length,
        bookings: seatBookings.slice(0, 50).map((b) => ({
          id: b._id,
          seatId: b.seatId,
          memberId: b.memberId,
          status: b.status,
          startAt: b.startAt,
          endAt: b.endAt,
          seatNumber: b.seat.seatNumber,
          seatType: b.seat.seatType,
        })),
        hasMore: seatBookings.length > 50,
      },
    };

    console.log('Resulting Payload:');
    console.log(JSON.stringify(response, null, 2));

  } finally {
    await client.close();
  }
}

testQuery().catch(console.error);
