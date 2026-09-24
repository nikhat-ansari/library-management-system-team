const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const uri = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-users?retryWrites=true&w=majority';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('lms-users');

    // Find the real active transaction for this member
    const tx = await db.collection('transactions').findOne({ 
        memberId: new ObjectId('6aa111c049dee7a2d37bcb14'), 
        status: 'ACTIVE' 
    });
    
    if (!tx) {
        console.log('Real transaction not found.');
        return;
    }

    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() - 10);
    
    await db.collection('transactions').updateOne(
        { _id: tx._id },
        { $set: { dueDate: newDueDate } }
    );
    
    console.log('--- TIME TRAVEL SUCCESSFUL ON REAL DB ---');
    console.log('Updated Due Date:', newDueDate.toISOString());
    console.log('Transaction Status:', tx.status);
    
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
