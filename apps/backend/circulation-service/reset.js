
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority')
  .then(async () => {
    const db = mongoose.connection.db;
    const res = await db.collection('book_copies').updateOne({ barcode: 'BC-987654321' }, { $set: { status: 'Available' } });
    console.log('Update result:', res);
    
    // Also clear transactions
    await db.collection('transactions').deleteMany({ 'copyId.barcode': 'BC-987654321' });
    
    const copy = await db.collection('book_copies').findOne({ barcode: 'BC-987654321' });
    console.log('Final Status:', copy.status);
    
    process.exit(0);
  });

