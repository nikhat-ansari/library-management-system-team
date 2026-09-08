import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createConnection, type Connection } from 'mongoose';
import { DashboardDataService } from './dashboard-data.service';

const uri = process.env.DASHBOARD_TEST_URI;
const database = process.env.DASHBOARD_TEST_DATABASE ?? 'lms-dashboard-test';

describe('DashboardDataService', { skip: !uri }, () => {
  let connection: Connection;
  let dataService: DashboardDataService;

  before(async () => {
    connection = await createConnection(uri!, { dbName: database }).asPromise();
    dataService = new DashboardDataService();
    (dataService as unknown as { connection: Connection }).connection = connection;
    await connection.db!.dropDatabase();
  });

  after(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('reflects a newly inserted book on the next read', async () => {
    const books = connection.db!.collection('books');
    const users = connection.db!.collection('users');
    const circulations = connection.db!.collection('circulations');
    const fines = connection.db!.collection('fines');
    const reservations = connection.db!.collection('reservations');
    const seats = connection.db!.collection('seats');
    await books.insertMany(Array.from({ length: 5 }, (_, index) => ({ title: `Book ${index}` })));
    await users.insertOne({ role: 'MEMBER' });
    await circulations.insertMany([
      { status: 'ISSUED', dueDate: new Date('2020-01-01') },
      { status: 'ISSUED', dueDate: new Date('2099-01-01') },
      { status: 'RETURNED', dueDate: new Date('2020-01-01') },
    ]);
    await fines.insertMany([{ status: 'PENDING', amount: 12.5 }, { status: 'PAID', amount: 9 }]);
    await reservations.insertMany([{ status: 'PENDING' }, { status: 'READY_FOR_PICKUP' }, { status: 'CANCELLED' }]);
    await seats.insertMany([{ status: 'OCCUPIED' }, { isOccupied: true }, { status: 'AVAILABLE' }]);

    const initial = await dataService.getDashboardCounts();
    assert.equal(initial.totalBooks, 5);
    assert.equal(initial.totalMembers, 1);
    assert.equal(initial.issuedBooks, 2);
    assert.equal(initial.overdueBooks, 1);
    assert.deepEqual(initial.fineSummary, { outstandingAmount: 12.5, pendingPayments: 1 });
    assert.deepEqual(initial.reservationSummary, { pending: 1, readyForPickup: 1 });
    assert.deepEqual(initial.seatUtilization, { occupied: 2, total: 3, percentage: 66.67 });

    await books.insertOne({ title: 'Book 5' });

    assert.equal((await dataService.getDashboardCounts()).totalBooks, 6);
  });

  it('returns zero for an existing empty collection and reports missing sources', async () => {
    await connection.db!.dropDatabase();
    await connection.db!.createCollection('books');
    const result = await dataService.getDashboardCounts();

    assert.equal(result.totalBooks, 0);
    assert.equal(result.totalMembers, 0);
    assert.equal(result.issuedBooks, 0);
    assert.equal(result.overdueBooks, 0);
    assert.deepEqual(result.fineSummary, { outstandingAmount: 0, pendingPayments: 0 });
    assert.deepEqual(result.reservationSummary, { pending: 0, readyForPickup: 0 });
    assert.deepEqual(result.seatUtilization, { occupied: 0, total: 0, percentage: 0 });
  });
});
