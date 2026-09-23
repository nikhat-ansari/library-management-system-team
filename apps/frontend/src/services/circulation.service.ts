import { apiClient as api } from '../lib/axios';

export interface IssueBookDto {
  memberId: string;
  copyBarcode: string;
}

export interface ReturnBookDto {
  copyBarcode: string;
  condition?: 'LOST' | 'DAMAGED';
}

export interface RenewBookDto {
  transactionId: string;
}

export interface Transaction {
  _id: string;
  memberId: string;
  bookId: { _id: string; title: string; authors: string[] };
  copyId: { _id: string; barcode: string; accessionNumber: string };
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  renewalCount: number;
  fineAmount?: number;
  isOverdue?: boolean;
}

export const circulationService = {
  issueBook: async (data: IssueBookDto) => {
    const response = await api.post('/circulation/issue', data);
    return response.data;
  },

  returnBook: async (data: ReturnBookDto) => {
    const response = await api.post('/circulation/return', data);
    return response.data;
  },

  renewBook: async (data: RenewBookDto) => {
    const response = await api.post('/circulation/renew', data);
    return response.data;
  },

  getMemberActiveLoans: async (memberId: string): Promise<Transaction[]> => {
    const response = await api.get(`/circulation/member/${memberId}/active`);
    return response.data;
  },
};
