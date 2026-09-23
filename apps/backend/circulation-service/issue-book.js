
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    
    // Find the member
    const member = await db.collection('users').findOne({ email: 'member@library.local' });
    if (!member) throw new Error('Member not found');
    
    // Find the copy and book
    const copy = await db.collection('book_copies').findOne({ barcode: 'BC-987654321' });
    if (!copy) throw new Error('Copy not found');
    const book = await db.collection('books').findOne({ _id: copy.bookId });
    
    // 1. Update copy status to Issued
    await db.collection('book_copies').updateOne({ _id: copy._id }, { $set: { status: 'Issued' } });
    
    // 2. Insert ACTIVE transaction
    const tx = {
      memberId: member._id.toString(), // sometimes circulation expects string for cross-service
      bookId: { _id: book._id, title: book.title, authors: book.authors },
      copyId: { _id: copy._id, barcode: copy.barcode, accessionNumber: copy.accessionNumber },
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'ACTIVE',
      renewalCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.collection('transactions').insertOne(tx);
    
    console.log('SUCCESSFULLY FAKED AN ISSUE RECORD!');
    process.exit(0);
  });

