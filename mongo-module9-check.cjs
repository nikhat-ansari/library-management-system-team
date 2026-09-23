const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
require('ts-node/register');

const module9Require = createRequire(path.resolve('apps/backend/auth-service/src/modules/librarian-dashboard/librarian-dashboard-data.service.ts'));
const { createConnection, version: mongooseVersion } = module9Require('mongoose');
const { Loan, LoanSchema } = module9Require('./schemas/loan.schema');
const { Reservation, ReservationSchema } = module9Require('./schemas/reservation.schema');
const { SeatBooking, SeatBookingSchema } = module9Require('./schemas/seat-booking.schema');

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const connection = createConnection(env.MONGODB_URI, env.DASHBOARD_DATABASE ? { dbName: env.DASHBOARD_DATABASE } : undefined);

async function bounded(label, operation) {
  const started = Date.now();
  let timeout;
  try {
    const result = await Promise.race([
      operation(),
      new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Timed out after 12 seconds')), 12_000); }),
    ]);
    console.log(`${label}: PASS (${Date.now() - started}ms)${result === undefined ? '' : ` — ${result}`}`);
    return result;
  } catch (error) {
    console.log(`${label}: FAIL (${Date.now() - started}ms) — ${error.message}`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

(async () => {
  console.log('URI source: MONGODB_URI');
  console.log(`Configured database: ${env.DASHBOARD_DATABASE ?? '(none)'}`);
  console.log(`Module 9 Mongoose: ${mongooseVersion} (${module9Require.resolve('mongoose')})`);
  if (!(await bounded('Mongo connection', () => connection.asPromise()))) process.exitCode = 1;
  if (connection.readyState !== 1) return;

  console.log(`Actual selected database: ${connection.db.databaseName}`);
  const collections = await bounded('List collections', async () => (await connection.db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name).sort().join(', '));
  const collectionNames = collections?.split(', ') ?? [];

  for (const name of ['loans', 'reservations', 'seat_bookings']) {
    const exists = collectionNames.includes(name);
    console.log(`${name}: ${exists ? 'EXISTS' : 'MISSING'}`);
    await bounded(`${name}.findOne`, async () => (await connection.db.collection(name).findOne({}, { maxTimeMS: 10_000 })) ? 'document found' : 'collection empty');
  }

  const loans = connection.model(Loan.name, LoanSchema);
  const reservations = connection.model(Reservation.name, ReservationSchema);
  const seatBookings = connection.model(SeatBooking.name, SeatBookingSchema);
  const today = new Date();

  await bounded('Module 9 loans.countDocuments', () => loans.countDocuments({ status: 'ACTIVE', dueDate: { $lt: today } }).exec());
  await bounded('Module 9 loans.find', () => loans.find({ status: 'ACTIVE', dueDate: { $lt: today } }).sort({ dueDate: 1, _id: 1 }).limit(26).lean().exec());
  await bounded('Module 9 reservations.countDocuments', () => reservations.countDocuments({ status: 'PENDING' }).exec());
  await bounded('Module 9 reservations.find', () => reservations.find({ status: 'PENDING' }).sort({ requestedAt: 1, _id: 1 }).limit(26).lean().exec());
  await bounded('Module 9 seat_bookings.countDocuments', () => seatBookings.countDocuments({ status: { $ne: 'CANCELLED' }, startAt: { $lt: today } }).exec());
  await bounded('Module 9 seat_bookings.find', () => seatBookings.find({ status: { $ne: 'CANCELLED' }, startAt: { $lt: today } }).sort({ startAt: 1, _id: 1 }).limit(26).lean().exec());

  await connection.close();
})().catch((error) => {
  console.error(`Diagnostic startup failed: ${error.message}`);
  process.exitCode = 1;
});
