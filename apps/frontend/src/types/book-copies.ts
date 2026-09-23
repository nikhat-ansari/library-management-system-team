export enum CopyStatus {
  AVAILABLE = 'Available',
  ISSUED = 'Issued',
  RESERVED = 'Reserved',
  LOST = 'Lost',
  DAMAGED = 'Damaged',
  MAINTENANCE = 'Maintenance',
  ARCHIVED = 'Archived'
}

export enum ChargeType {
  CHARGE = 'CHARGE',
  REVERSAL = 'REVERSAL'
}

export enum ChargeWorkflow {
  LOST = 'LOST',
  DAMAGED = 'DAMAGED',
  FOUND = 'FOUND'
}

export interface ChargeRecord {
  id: string;
  type: ChargeType;
  amount: number;
  reason: string;
  workflow: ChargeWorkflow;
  actorId: string;
  createdAt: string;
}

export interface BookCopy {
  _id: string;
  bookId: string;
  accessionNumber: string;
  barcode?: string;
  condition?: string;
  status: CopyStatus;
  chargeHistory: ChargeRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface BookCopiesResponse {
  titleAvailable: boolean;
  copies: BookCopy[];
}

export interface CreateBookCopyDto {
  accessionNumber: string;
  barcode?: string;
  condition?: string;
}

export interface UpdateBookCopyDto {
  accessionNumber?: string;
  barcode?: string;
  condition?: string;
}

export interface UpdateStatusDto {
  status: string;
}

export interface LostDamagedDto {
  type: 'LOST' | 'DAMAGED';
  reason?: string;
}

export interface FoundDto {
  reason?: string;
}
