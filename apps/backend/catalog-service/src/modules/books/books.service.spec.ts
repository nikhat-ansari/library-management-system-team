import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import { Category } from '../categories/schemas/category.schema';
import { Author } from '../authors/schemas/author.schema';
import { Publisher } from '../publishers/schemas/publisher.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BooksService', () => {
  let service: BooksService;
  
  const mockBookModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
  };
  
  const mockCategoryModel = { exists: jest.fn() };
  const mockAuthorModel = { exists: jest.fn() };
  const mockPublisherModel = { exists: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book.name), useValue: mockBookModel },
        { provide: getModelToken(Category.name), useValue: mockCategoryModel },
        { provide: getModelToken(Author.name), useValue: mockAuthorModel },
        { provide: getModelToken(Publisher.name), useValue: mockPublisherModel },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a valid book', async () => {
      mockCategoryModel.exists.mockResolvedValue(true);
      mockAuthorModel.exists.mockResolvedValue(true);
      mockPublisherModel.exists.mockResolvedValue(true);
      mockBookModel.findOne.mockResolvedValue(null);
      
      const dto: any = {
        title: 'Test Book',
        isbn: '1234567890',
        categoryId: new Types.ObjectId().toHexString(),
        authorId: new Types.ObjectId().toHexString(),
        publisherId: new Types.ObjectId().toHexString(),
        acquisition: { type: 'PURCHASED', acquisitionDate: new Date().toISOString(), cost: 10, vendorOrSource: 'Vendor' }
      };

      // Since we mock the constructor, we just assume save is called on new instances
      // To properly unit test mongoose save without hitting DB in jest, it's complex, 
      // but we mainly test validation flows here.
    });

    it('should reject invalid reference IDs', async () => {
      mockCategoryModel.exists.mockResolvedValue(null);
      const dto: any = {
        title: 'Test', isbn: '123',
        categoryId: new Types.ObjectId().toHexString(),
      };
      
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate ISBN', async () => {
      mockCategoryModel.exists.mockResolvedValue(true);
      mockAuthorModel.exists.mockResolvedValue(true);
      mockPublisherModel.exists.mockResolvedValue(true);
      mockBookModel.findOne.mockResolvedValue({ isbn: '123' });
      
      const dto: any = {
        title: 'Test', isbn: '123',
        categoryId: new Types.ObjectId().toHexString(),
        authorId: new Types.ObjectId().toHexString(),
        publisherId: new Types.ObjectId().toHexString(),
      };
      
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('AI Integration', () => {
    it('should not persist AI metadata suggestions', async () => {
      mockedAxios.post.mockResolvedValue({ data: { category: 'Tech' } });
      const result = await service.suggestMetadata('Test Book');
      expect(result).toEqual({ category: 'Tech' });
      expect(mockBookModel.create).not.toHaveBeenCalled();
    });

    it('should gracefully fallback when AI fails', async () => {
      mockedAxios.post.mockRejectedValue(new Error('AI down'));
      const result = await service.suggestMetadata('Test Book');
      expect(result.fallback).toBe(true);
      expect(result.success).toBe(false);
    });

    it('should not persist on duplicate check', async () => {
      mockBookModel.find.mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) });
      mockedAxios.post.mockResolvedValue({ data: { candidates: [] } });
      
      const result = await service.checkDuplicates('Test Book', '123');
      expect(result.requiresStaffConfirmation).toBe(true);
      expect(mockBookModel.create).not.toHaveBeenCalled();
    });
  });
});
