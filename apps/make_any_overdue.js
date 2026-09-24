const { MongoClient } = require('mongodb');

async function run() {
  const uriCirc = 'mongodb+srv://nikhatansari:abuzar123@cluster0.tgnjev2.mongodb.net/lms-circulation?retryWrites=true&w=majority';
  const client = new MongoClient(uriCirc);

  try {
    await client.connect();
    const db = client.db('lms-circulation');

    // Find ANY active transaction
    const activeTx = await db.collection('transactions').findOne({ status: 'ACTIVE' });
    
    if (activeTx) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);
        
        await db.collection('transactions').updateOne(
            { _id: activeTx._id },
            { 
                $set: { 
                    dueDate: pastDate,
                    fineAmount: 150 
                }
            }
        );
        console.log('Successfully backdated transaction for member ID:', activeTx.memberId);
    } else {
        console.log('No active loans found in the database AT ALL.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
