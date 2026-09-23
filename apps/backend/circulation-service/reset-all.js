
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    
    // 1. Delete any active transactions for this copy
    await db.collection('transactions').deleteMany({ 'copyId.barcode': 'BC-987654321' });
    
    // 2. Set copy status back to 'Available'
    await db.collection('book_copies').updateOne({ barcode: 'BC-987654321' }, { $set: { status: 'Available' } });
    
    console.log('RESET DONE: Copy is Available and has no active loans.');
    process.exit(0);
  });

