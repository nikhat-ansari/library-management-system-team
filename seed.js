const mongoose = require('mongoose');

async function seed() {
    await mongoose.connect('mongodb://localhost:27017/library');
    console.log('Connected to DB');
    
    // Check if we have authors
    const Author = mongoose.connection.collection('authors');
    let author = await Author.findOne();
    if (!author) {
        const res = await Author.insertOne({ name: 'Test Author', createdAt: new Date(), updatedAt: new Date() });
        author = { _id: res.insertedId };
    }
    
    const Publisher = mongoose.connection.collection('publishers');
    let publisher = await Publisher.findOne();
    if (!publisher) {
        const res = await Publisher.insertOne({ name: 'Test Publisher', createdAt: new Date(), updatedAt: new Date() });
        publisher = { _id: res.insertedId };
    }

    const Category = mongoose.connection.collection('categories');
    let category = await Category.findOne();
    if (!category) {
        const res = await Category.insertOne({ name: 'Test Category', createdAt: new Date(), updatedAt: new Date() });
        category = { _id: res.insertedId };
    }

    const Book = mongoose.connection.collection('books');
    let book = await Book.findOne();
    if (!book) {
        const res = await Book.insertOne({
            title: 'Test Book',
            isbn: '978-0000000001',
            categoryId: category._id,
            authorId: author._id,
            publisherId: publisher._id,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        book = { _id: res.insertedId };
    }
    
    const BookCopy = mongoose.connection.collection('bookcopies');
    let copy = await BookCopy.findOne({ bookId: book._id });
    if (!copy) {
        await BookCopy.insertOne({
            bookId: book._id,
            barcode: 'BC1001',
            accessionNumber: 'ACC1001',
            status: 'Available',
            createdAt: new Date(),
            updatedAt: new Date()
        });
    } else {
        await BookCopy.updateOne({ _id: copy._id }, { $set: { status: 'Available' } });
    }
    
    console.log('Seed completed successfully');
    process.exit(0);
}

seed().catch(console.error);
