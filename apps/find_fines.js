const { MongoClient } = require('mongodb');

async function run() {
  const uriCirc = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-circulation?retryWrites=true&w=majority';
  const client = new MongoClient(uriCirc);

  try {
    await client.connect();
    const db = client.db('lms-circulation');
    
    const overdueTransaction = await db.collection('transactions').findOne({ fineAmount: { $gt: 0 } });
    if (overdueTransaction) {
        console.log('--- FOUND OVERDUE LOAN ---');
        console.log('Member ID:', overdueTransaction.memberId);
        console.log('Fine Amount:', overdueTransaction.fineAmount);
        console.log('Book Barcode:', overdueTransaction.copyBarcode);
    } else {
        console.log('No overdue transactions found with fineAmount > 0.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
