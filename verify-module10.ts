import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import mongoose from 'mongoose';

const GATEWAY_URL = 'http://localhost:3000/api/books';
const AUTH_URL = 'http://localhost:3000/auth/login';
const DB_URI = 'mongodb://localhost:27017/lms-users';

let token = '';

async function login() {
  console.log('Logging in as Librarian/Staff...');
  // The system seeds a user on start. Assuming 'librarian@lms.com' or similar.
  // We need an actual login payload. Let's try to query the DB to find a user first.
  await mongoose.connect(DB_URI);
  const user = await mongoose.connection.collection('users').findOne({ roles: 'LIBRARIAN_STAFF' });
  if (!user) {
    console.log('No LIBRARIAN_STAFF user found in DB. Attempting to seed one...');
    // We'll insert one for testing
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await mongoose.connection.collection('users').insertOne({
      email: 'testlib@lms.com',
      password: hash,
      firstName: 'Test',
      lastName: 'Lib',
      roles: ['LIBRARIAN_STAFF'],
      status: 'active',
      tokenVersion: 1
    });
  }
  
  const email = user ? user.email : 'testlib@lms.com';
  
  try {
    const res = await axios.post(AUTH_URL, { email, password: 'password123' });
    token = res.data.accessToken;
    console.log('Login successful');
  } catch (err: any) {
    console.error('Login failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function verifyRBAC() {
  console.log('\n--- Verifying RBAC ---');
  try {
    await axios.get(GATEWAY_URL);
    console.log('FAIL: Unauthenticated request succeeded');
  } catch (err: any) {
    if (err.response?.status === 401) console.log('PASS: Unauthenticated request rejected (401)');
    else console.log('FAIL: Unauthenticated request returned', err.response?.status);
  }
  
  try {
    await axios.get(GATEWAY_URL, { headers: { Authorization: `Bearer ${token}` } });
    console.log('PASS: LIBRARIAN_STAFF request succeeded (200)');
  } catch (err: any) {
    console.log('FAIL: LIBRARIAN_STAFF request failed', err.response?.status, err.response?.data);
  }
}

async function verifyAI() {
  console.log('\n--- Verifying AI Non-Persistence ---');
  const countBefore = await mongoose.connection.collection('books').countDocuments();
  
  try {
    const res = await axios.post(`${GATEWAY_URL}/ai/metadata-suggestion`, { title: 'Dune' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Metadata suggestion returned:', res.data.fallback ? 'Fallback' : 'AI result');
  } catch (err: any) {
    console.log('Metadata suggestion err:', err.response?.data || err.message);
  }

  const countAfter = await mongoose.connection.collection('books').countDocuments();
  if (countBefore === countAfter) console.log('PASS: AI did not persist records');
  else console.log('FAIL: AI persisted records');
}

async function verifyImport() {
  console.log('\n--- Verifying Bulk Import (CSV) ---');
  
  // Need valid category, author, publisher
  const cat = await mongoose.connection.collection('categories').insertOne({ name: 'Sci-Fi', createdAt: new Date(), updatedAt: new Date() });
  const auth = await mongoose.connection.collection('authors').insertOne({ name: 'Frank Herbert', createdAt: new Date(), updatedAt: new Date() });
  const pub = await mongoose.connection.collection('publishers').insertOne({ name: 'Chilton', createdAt: new Date(), updatedAt: new Date() });

  const csvContent = `title,isbn,categoryId,authorId,publisherId,acquisitionType,acquisitionDate,cost,vendorOrSource
Dune,9780441172719,${cat.insertedId},${auth.insertedId},${pub.insertedId},PURCHASED,2023-01-01,15.99,Amazon
InvalidBook,999,invalid,invalid,invalid,INVALID_TYPE,,,-1,`;

  const csvPath = path.join(__dirname, 'test-import.csv');
  fs.writeFileSync(csvPath, csvContent);

  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', fs.createReadStream(csvPath));

  try {
    const res = await axios.post(`${GATEWAY_URL}/import`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('Import result accepted:', res.data.acceptedCount, 'rejected:', res.data.rejectedCount);
    if (res.data.acceptedCount === 1 && res.data.rejectedCount === 1) {
      console.log('PASS: Valid row accepted, invalid row rejected');
      console.log('Rejected reason:', res.data.rejectedRows[0].validationReasons);
    } else {
      console.log('FAIL: Import counts mismatch', res.data);
    }
  } catch (err: any) {
    console.log('FAIL: Import threw error', err.response?.data || err.message);
  }
}

async function verifyDuplicate() {
  console.log('\n--- Verifying Duplicate ISBN Rejection ---');
  const cat = await mongoose.connection.collection('categories').findOne();
  const auth = await mongoose.connection.collection('authors').findOne();
  const pub = await mongoose.connection.collection('publishers').findOne();

  const bookData = {
    title: 'Dune Duplicate',
    isbn: '9780441172719', // Same ISBN as imported above
    categoryId: cat!._id,
    authorId: auth!._id,
    publisherId: pub!._id,
    acquisition: {
      type: 'DONATED',
      acquisitionDate: '2023-01-01T00:00:00Z',
      cost: 0,
      vendorOrSource: 'Patron'
    }
  };

  try {
    await axios.post(GATEWAY_URL, bookData, { headers: { Authorization: `Bearer ${token}` } });
    console.log('FAIL: Duplicate was created');
  } catch (err: any) {
    if (err.response?.status === 400 && err.response?.data?.message?.includes('ISBN already exists')) {
      console.log('PASS: Duplicate ISBN rejected properly');
    } else {
      console.log('FAIL: Duplicate rejected for wrong reason', err.response?.data);
    }
  }
}

async function run() {
  try {
    await login();
    await verifyRBAC();
    await verifyAI();
    await verifyImport();
    await verifyDuplicate();
    
    console.log('\n--- Verifying Indexes ---');
    const indexes = await mongoose.connection.collection('books').indexes();
    const isbnIndex = indexes.find((i: any) => i.key.isbn === 1);
    const titleIndex = indexes.find((i: any) => i.key.title === 'text');
    console.log(isbnIndex && isbnIndex.unique ? 'PASS: ISBN unique index exists' : 'FAIL: ISBN unique index missing');
    console.log(titleIndex ? 'PASS: Title text index exists' : 'FAIL: Title text index missing');

  } catch (err) {
    console.error('Test script failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
