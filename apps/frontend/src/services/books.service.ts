import { apiClient } from '../lib/axios';
import type { Book, CreateBookDto, UpdateBookDto, BookQueryDto, PaginatedBooks } from '../types/books';

export const booksService = {
  async findAll(query?: BookQueryDto): Promise<PaginatedBooks> {
    const skip = query?.page ? (query.page - 1) * (query.limit || 10) : 0;
    const backendQuery: any = {
      skip,
      limit: query?.limit || 10,
    };
    if (query?.search) {
      backendQuery.title = query.search; // Backend search is by title (or isbn, but title is most common)
    }
    if (query?.categoryId) backendQuery.categoryId = query.categoryId;
    if (query?.authorId) backendQuery.authorId = query.authorId;
    if (query?.publisherId) backendQuery.publisherId = query.publisherId;

    const { data } = await apiClient.get<PaginatedBooks>('/books', { params: backendQuery });
    return data;
  },

  async findOne(id: string): Promise<Book> {
    const { data } = await apiClient.get<Book>(`/books/${id}`);
    return data;
  },

  async create(dto: CreateBookDto): Promise<Book> {
    const { data } = await apiClient.post<Book>('/books', dto);
    return data;
  },

  async update(id: string, dto: UpdateBookDto): Promise<Book> {
    const { data } = await apiClient.patch<Book>(`/books/${id}`, dto);
    return data;
  },

  async importBulk(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/books/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async suggestMetadata(title: string, isbn?: string): Promise<any> {
    const { data } = await apiClient.post('/books/ai/metadata-suggestion', { title, isbn });
    return data;
  },

  async duplicateCheck(title: string, isbn: string): Promise<any> {
    const { data } = await apiClient.post('/books/ai/duplicate-check', { title, isbn });
    return data;
  },

  async exportCatalogue(): Promise<any> {
    const { data } = await apiClient.get('/books/export');
    return data;
  }
};
