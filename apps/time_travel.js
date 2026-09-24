const { MongoClient } = require('mongodb');

async function run() {
  const uriCirc = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-circulation?retryWrites=true&w=majority';
  const client = new MongoClient(uriCirc);

  try {
    await client.connect();
    const db = client.db('lms-circulation');

    const tx = await db.collection('transactions').findOne({ copyBarcode: 'BC-1002', status: 'ACTIVE' });
    if (!tx) {
        console.log('Transaction for BC-1002 not found.');
        return;
    }

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() - 10);
    
    await db.collection('transactions').updateOne(
        { _id: tx._id },
        { $set: { dueDate: newDueDate } }
    );
    
    console.log('--- TIME TRAVEL SUCCESSFUL ---');
    console.log('Updated Due Date:', newDueDate.toISOString());
    console.log('Transaction Status:', tx.status);
    
    // Check if the system auto-calculates fineAmount dynamically
    const updatedTx = await db.collection('transactions').findOne({ _id: tx._id });
    console.log('Current DB Fine Amount:', updatedTx.fineAmount);

  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
