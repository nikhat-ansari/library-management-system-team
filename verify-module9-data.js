const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms-users';
  const dbName = process.env.DASHBOARD_DATABASE || 'lms-users';
  console.log('Connecting to MongoDB:', uri.replace(/:([^:@]{3,})@/, ':***@'));
  console.log('Database:', dbName);
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Clean up specific collections first to have a clean state for the test
    await db.collection('books').deleteMany({});
    await db.collection('book_copies').deleteMany({});
    await db.collection('loans').deleteMany({});
    await db.collection('reservations').deleteMany({});
    await db.collection('seats').deleteMany({});
    await db.collection('seat_bookings').deleteMany({});

    console.log('Collections cleaned.');

    const book1Id = new ObjectId();
    const copy1Id = new ObjectId();
    const book2Id = new ObjectId();
    const copy2Id = new ObjectId();
    const book3Id = new ObjectId();
    
    // Create Books
    await db.collection('books').insertMany([
      { _id: book1Id, title: 'Book Due Today', isbn: '111', createdAt: new Date() },
      { _id: book2Id, title: 'Book Overdue', isbn: '222', createdAt: new Date() },
      { _id: book3Id, title: 'Book Reserved', isbn: '333', createdAt: new Date() },
    ]);

    await db.collection('book_copies').insertMany([
      { _id: copy1Id, bookId: book1Id, accessionNumber: 'A1', status: 'ISSUED', createdAt: new Date() },
      { _id: copy2Id, bookId: book2Id, accessionNumber: 'A2', status: 'ISSUED', createdAt: new Date() },
    ]);

    const nowKolkataString = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    const nowKolkata = new Date(nowKolkataString);
    
    const kolkataYear = nowKolkata.getFullYear();
    const kolkataMonth = nowKolkata.getMonth();
    const kolkataDate = nowKolkata.getDate();
    
    // Create a UTC date that falls precisely at 12:00 PM Kolkata time today.
    // Kolkata is UTC+5:30. So 12:00 PM IST is 06:30 AM UTC.
    const dueTodayDate = new Date(Date.UTC(kolkataYear, kolkataMonth, kolkataDate, 6, 30, 0));
    
    // Overdue book: 12:00 PM IST yesterday -> 06:30 AM UTC yesterday.
    const overdueDate = new Date(Date.UTC(kolkataYear, kolkataMonth, kolkataDate - 1, 6, 30, 0));

    await db.collection('loans').insertMany([
      { _id: new ObjectId(), bookId: book1Id, copyId: copy1Id, memberId: 'member-001', status: 'ACTIVE', dueDate: dueTodayDate, issuedAt: new Date() },
      { _id: new ObjectId(), bookId: book2Id, copyId: copy2Id, memberId: 'member-002', status: 'ACTIVE', dueDate: overdueDate, issuedAt: new Date() }
    ]);

    // One pending reservation
    await db.collection('reservations').insertOne({
      _id: new ObjectId(), bookId: book3Id, memberId: 'member-003', status: 'PENDING', requestedAt: new Date()
    });

    const seat1Id = new ObjectId();
    const seat2Id = new ObjectId();
    
    await db.collection('seats').insertMany([
      { _id: seat1Id, seatNumber: 'S1', seatType: 'AC', capacity: 1, isActive: true },
      { _id: seat2Id, seatNumber: 'S2', seatType: 'NON_AC', capacity: 1, isActive: true }
    ]);

    // Seat Bookings
    const startAt = new Date(Date.UTC(kolkataYear, kolkataMonth, kolkataDate, 4, 30, 0)); // 10:00 AM IST
    const endAt = new Date(Date.UTC(kolkataYear, kolkataMonth, kolkataDate, 6, 30, 0)); // 12:00 PM IST

    await db.collection('seat_bookings').insertMany([
      // One non-cancelled seat booking
      { _id: new ObjectId(), seatId: seat1Id, memberId: 'member-004', status: 'CONFIRMED', startAt: startAt, endAt: endAt },
      // One cancelled seat booking
      { _id: new ObjectId(), seatId: seat2Id, memberId: 'member-005', status: 'CANCELLED', startAt: startAt, endAt: endAt },
    ]);

    console.log('Test records inserted successfully.');

  } finally {
    await client.close();
  }
}

run().catch(console.error);
