import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Book, BookDocument } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { Author, AuthorDocument } from '../authors/schemas/author.schema';
import { Publisher, PublisherDocument } from '../publishers/schemas/publisher.schema';
import axios from 'axios';
import * as csv from 'csv-parser';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

@Injectable()
export class BooksService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://ai-service:3011';
  private readonly aiEnabled = process.env.AI_ENABLED === 'true';

  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
    @InjectModel(Publisher.name) private publisherModel: Model<PublisherDocument>,
  ) {}

  async findAll(query: any) {
    const filter: any = {};
    if (query.title) filter.title = { $regex: query.title, $options: 'i' };
    if (query.isbn) filter.isbn = query.isbn;
    if (query.categoryId) filter.categoryId = new Types.ObjectId(query.categoryId);
    if (query.authorId) filter.authorId = new Types.ObjectId(query.authorId);
    if (query.publisherId) filter.publisherId = new Types.ObjectId(query.publisherId);

    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const skip = query.skip ? parseInt(query.skip, 10) : 0;

    const [items, total] = await Promise.all([
      this.bookModel.find(filter).skip(skip).limit(limit).exec(),
      this.bookModel.countDocuments(filter).exec(),
    ]);

    return { items, total, skip, limit };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID format');
    const book = await this.bookModel.findById(id).exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(createBookDto: CreateBookDto) {
    await this.validateReferences(createBookDto.categoryId, createBookDto.authorId, createBookDto.publisherId);
    
    const existing = await this.bookModel.findOne({ isbn: createBookDto.isbn }).exec();
    if (existing) {
      throw new BadRequestException('A book with this ISBN already exists');
    }

    const createdBook = new this.bookModel({
      ...createBookDto,
      categoryId: new Types.ObjectId(createBookDto.categoryId),
      authorId: new Types.ObjectId(createBookDto.authorId),
      publisherId: new Types.ObjectId(createBookDto.publisherId),
    });
    return createdBook.save();
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID format');

    if (updateBookDto.categoryId || updateBookDto.authorId || updateBookDto.publisherId) {
      await this.validateReferences(
        updateBookDto.categoryId, 
        updateBookDto.authorId, 
        updateBookDto.publisherId
      );
    }

    if (updateBookDto.isbn) {
      const existing = await this.bookModel.findOne({ isbn: updateBookDto.isbn, _id: { $ne: new Types.ObjectId(id) } }).exec();
      if (existing) {
        throw new BadRequestException('A book with this ISBN already exists');
      }
    }

    const updatedBook = await this.bookModel.findByIdAndUpdate(id, updateBookDto, { new: true }).exec();
    if (!updatedBook) throw new NotFoundException('Book not found');
    return updatedBook;
  }

  private async validateReferences(categoryId?: string, authorId?: string, publisherId?: string) {
    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) throw new BadRequestException('Invalid Category ID');
      const cat = await this.categoryModel.exists({ _id: new Types.ObjectId(categoryId) });
      if (!cat) throw new BadRequestException('Category not found');
    }
    if (authorId) {
      if (!Types.ObjectId.isValid(authorId)) throw new BadRequestException('Invalid Author ID');
      const author = await this.authorModel.exists({ _id: new Types.ObjectId(authorId) });
      if (!author) throw new BadRequestException('Author not found');
    }
    if (publisherId) {
      if (!Types.ObjectId.isValid(publisherId)) throw new BadRequestException('Invalid Publisher ID');
      const pub = await this.publisherModel.exists({ _id: new Types.ObjectId(publisherId) });
      if (!pub) throw new BadRequestException('Publisher not found');
    }
  }

  async exportCatalogue() {
    const books = await this.bookModel.find().lean().exec();
    return books; 
  }

  async suggestMetadata(title: string, isbn?: string) {
    if (!this.aiEnabled) {
      return { 
        success: false, 
        message: 'AI assistance is currently disabled.',
        fallback: true
      };
    }
    
    try {
      const response = await axios.post(`${this.aiServiceUrl}/api/ai/books/metadata-suggestion`, { title, isbn });
      return response.data;
    } catch (error) {
      return { 
        success: false, 
        message: 'AI service is unavailable. Please enter metadata manually.',
        fallback: true
      };
    }
  }

  async checkDuplicates(title: string, isbn: string) {
    const deterministicCandidates = await this.bookModel.find({
      $or: [
        { isbn: isbn },
        { title: { $regex: new RegExp(`^${title}$`, 'i') } }
      ]
    }).limit(5).exec();

    let aiCandidates = [];
    if (this.aiEnabled) {
      try {
        const response = await axios.post(`${this.aiServiceUrl}/api/ai/books/duplicate-check`, { title, isbn });
        aiCandidates = response.data?.candidates || [];
      } catch (error) {
        // AI failure shouldn't block deterministic checks
      }
    }

    return {
      candidates: deterministicCandidates,
      aiCandidates: aiCandidates,
      requiresStaffConfirmation: true,
      message: 'Review potential duplicates. Staff confirmation is required before proceeding.'
    };
  }

  async importBulk(file: Express.Multer.File) {
    if (!file || file.size === 0) throw new BadRequestException('Empty file');
    
    const isCsv = file.originalname.endsWith('.csv') || file.mimetype === 'text/csv';
    const isExcel = file.originalname.endsWith('.xlsx') || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    if (!isCsv && !isExcel) {
      throw new BadRequestException('Invalid file type. Only CSV and Excel (.xlsx) are supported.');
    }

    const rows: any[] = [];
    
    if (isCsv) {
      await new Promise<void>((resolve, reject) => {
        Readable.from(file.buffer as any)
          .pipe(csv())
          .on('data', (data) => rows.push(data))
          .on('end', () => resolve())
          .on('error', (err) => reject(new BadRequestException('CSV Parsing Error')));
      });
    } else {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer as any);
      const worksheet = workbook.worksheets[0];
      
      const headers: string[] = [];
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value ? cell.value.toString() : `Column${colNumber}`;
      });
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; 
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber]] = cell.value;
        });
        rows.push(rowData);
      });
    }

    const result = {
      totalRows: rows.length,
      acceptedCount: 0,
      rejectedCount: 0,
      acceptedRows: [] as any[],
      rejectedRows: [] as any[]
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; 
      const errors = [];

      if (!row.title) errors.push('Title is required');
      if (!row.isbn) errors.push('ISBN is required');
      if (!row.categoryId || !Types.ObjectId.isValid(row.categoryId)) errors.push('Valid Category ID is required');
      if (!row.authorId || !Types.ObjectId.isValid(row.authorId)) errors.push('Valid Author ID is required');
      if (!row.publisherId || !Types.ObjectId.isValid(row.publisherId)) errors.push('Valid Publisher ID is required');
      if (!row.acquisitionType || !['PURCHASED', 'DONATED'].includes(row.acquisitionType)) errors.push('Acquisition Type must be PURCHASED or DONATED');
      if (!row.acquisitionDate) errors.push('Acquisition Date is required');
      
      const cost = parseFloat(row.cost);
      if (isNaN(cost) || cost < 0) errors.push('Cost must be a valid positive number');
      
      if (!row.vendorOrSource) errors.push('Vendor or Source is required');

      if (errors.length === 0) {
        try {
          await this.validateReferences(row.categoryId, row.authorId, row.publisherId);
          
          const existing = await this.bookModel.findOne({ isbn: row.isbn }).exec();
          if (existing) {
            errors.push('A book with this ISBN already exists');
          }
        } catch (err: any) {
          errors.push(err.message || 'Reference validation failed');
        }
      }

      if (errors.length > 0) {
        result.rejectedRows.push({ rowNumber, row, validationReasons: errors });
        result.rejectedCount++;
      } else {
        const newBook = new this.bookModel({
          title: row.title,
          isbn: row.isbn,
          categoryId: new Types.ObjectId(row.categoryId),
          authorId: new Types.ObjectId(row.authorId),
          publisherId: new Types.ObjectId(row.publisherId),
          acquisition: {
            type: row.acquisitionType,
            acquisitionDate: new Date(row.acquisitionDate),
            cost: cost,
            vendorOrSource: row.vendorOrSource
          }
        });
        
        await newBook.save();
        result.acceptedRows.push(newBook);
        result.acceptedCount++;
      }
    }

    return result;
  }
}
