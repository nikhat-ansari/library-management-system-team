const { MongoClient } = require('mongodb');

async function run() {
  const uriCirc = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-circulation?retryWrites=true&w=majority';
  const client = new MongoClient(uriCirc);

  try {
    await client.connect();
    const db = client.db('lms-circulation');

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    
    // Force insert an overdue transaction for the exact member ID the user is testing
    await db.collection('transactions').insertOne({
        memberId: "6aa111c049dee7a2d37bcb14",
        copyBarcode: "BC-1002",
        status: "ACTIVE",
        issueDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
        dueDate: pastDate,
        fineAmount: 250,
        finePaidAmount: 0,
        fineWaivedAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    
    console.log('Successfully injected a guaranteed overdue fine for testing!');
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
