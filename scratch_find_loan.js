const { MongoClient } = require('mongodb');

async function run() {
  const uri = "mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');
    const transactions = await db.collection('transactions').find({ status: 'ACTIVE' }).toArray();
    console.log("ACTIVE TRANSACTIONS:");
    for (const t of transactions) {
      const copy = await db.collection('book_copies').findOne({ _id: t.copyId });
      console.log(`Copy barcode: ${copy?.barcode}, copy status: ${copy?.status}`);
    }
  } finally {
    await client.close();
  }
}

run().catch(console.error);
