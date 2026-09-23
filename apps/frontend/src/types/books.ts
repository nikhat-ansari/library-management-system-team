export interface BookAcquisition {
  type: 'PURCHASED' | 'DONATED';
  acquisitionDate: string;
  cost?: number;
  vendorOrSource?: string;
}

export interface Book {
  _id: string;
  title: string;
  isbn: string;
  categoryId: string;
  authorId: string;
  publisherId: string;
  acquisition: BookAcquisition;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookDto {
  title: string;
  isbn: string;
  categoryId: string;
  authorId: string;
  publisherId: string;
  acquisition: BookAcquisition;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}

export interface BookQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  authorId?: string;
  publisherId?: string;
}

export interface PaginatedBooks {
  items: Book[];
  total: number;
  skip: number;
  limit: number;
}
