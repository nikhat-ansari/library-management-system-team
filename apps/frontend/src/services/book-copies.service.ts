import { apiClient } from '../lib/axios';
import type { 
  BookCopiesResponse, 
  BookCopy, 
  CreateBookCopyDto, 
  UpdateBookCopyDto, 
  UpdateStatusDto, 
  LostDamagedDto, 
  FoundDto 
} from '../types/book-copies';

export const bookCopiesService = {
  async findByBookId(bookId: string): Promise<BookCopiesResponse> {
    const { data } = await apiClient.get<BookCopiesResponse>(`/books/${bookId}/copies`);
    return data;
  },

  async create(bookId: string, dto: CreateBookCopyDto): Promise<BookCopy> {
    const { data } = await apiClient.post<BookCopy>(`/books/${bookId}/copies`, dto);
    return data;
  },

  async update(id: string, dto: UpdateBookCopyDto): Promise<BookCopy> {
    const { data } = await apiClient.patch<BookCopy>(`/book-copies/${id}`, dto);
    return data;
  },

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<BookCopy> {
    const { data } = await apiClient.patch<BookCopy>(`/book-copies/${id}/status`, dto);
    return data;
  },

  async reportLostDamaged(id: string, dto: LostDamagedDto): Promise<BookCopy> {
    const { data } = await apiClient.post<BookCopy>(`/book-copies/${id}/lost-damaged`, dto);
    return data;
  },

  async reportFound(id: string, dto: FoundDto): Promise<BookCopy> {
    const { data } = await apiClient.post<BookCopy>(`/book-copies/${id}/found`, dto);
    return data;
  },

  async archive(id: string): Promise<BookCopy> {
    const { data } = await apiClient.delete<BookCopy>(`/book-copies/${id}`);
    return data;
  }
};
