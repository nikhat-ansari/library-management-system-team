const { MongoClient } = require('mongodb');

async function run() {
  const uriCirc = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-circulation?retryWrites=true&w=majority';
  const client = new MongoClient(uriCirc);

  try {
    await client.connect();
    const db = client.db('lms-circulation');
    const memberId = '6aa111c049dee7a2d37bcb14';

    // Find the active transaction
    const activeTx = await db.collection('transactions').findOne({ memberId: memberId, status: 'ACTIVE' });
    
    if (activeTx) {
        // Backdate it and add a fine
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10); // 10 days overdue
        
        await db.collection('transactions').updateOne(
            { _id: activeTx._id },
            { 
                $set: { 
                    dueDate: pastDate,
                    fineAmount: 150 // ₹150 fine
                }
            }
        );
        console.log('Successfully backdated transaction and added a ₹150 fine!');
    } else {
        console.log('No active loans found for this member yet.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
