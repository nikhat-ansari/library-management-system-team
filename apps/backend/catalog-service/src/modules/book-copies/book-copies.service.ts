import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import { BookCopy, BookCopyDocument, CopyStatus, ChargeType, ChargeWorkflow } from './schemas/book-copy.schema';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Book, BookDocument } from '../books/schemas/book.schema';

@Injectable()
export class BookCopiesService {
  private readonly userServiceUrl = process.env.USER_SERVICE_URL && !process.env.USER_SERVICE_URL.includes('user-service') ? process.env.USER_SERVICE_URL : 'http://localhost:3002';

  constructor(
    @InjectModel(BookCopy.name) private readonly bookCopyModel: Model<BookCopyDocument>,
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {}

  private async triggerAudit(authorization: string, actorId: string, action: string, recordId: string, oldState: any, newState: any) {
    try {
      await axios.post(`${this.userServiceUrl}/api/audit`, {
        actorId,
        action,
        module: 'CATALOG_COPIES',
        recordReference: { id: recordId, type: 'BOOK_COPY' },
        oldChangeSummary: oldState,
        newChangeSummary: newState
      }, { headers: { Authorization: authorization } });
    } catch (e) {
      // Non-blocking audit failure as per standard microservice resilience patterns,
      // though ideally handled via message queue.
      console.error('Failed to trigger audit', e);
    }
  }

  async findByBookId(bookId: string) {
    if (!Types.ObjectId.isValid(bookId)) throw new BadRequestException('Invalid Book ID');
    
    const copies = await this.bookCopyModel.find({ bookId: new Types.ObjectId(bookId) }).lean().exec();
    const titleAvailable = copies.some(c => c.status === CopyStatus.AVAILABLE);

    return {
      titleAvailable,
      copies
    };
  }

  async findByBarcode(barcode: string) {
    const copy = await this.bookCopyModel.findOne({ barcode }).lean().exec();
    if (!copy) throw new NotFoundException('Copy not found');
    return copy;
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Copy ID');
    const copy = await this.bookCopyModel.findById(id).lean().exec();
    if (!copy) throw new NotFoundException('Copy not found');
    return copy;
  }

  async create(authorization: string, bookId: string, createDto: CreateBookCopyDto, actorId: string) {
    if (!Types.ObjectId.isValid(bookId)) throw new BadRequestException('Invalid Book ID');
    
    const book = await this.bookModel.findById(bookId).lean().exec();
    if (!book) throw new NotFoundException('Book not found');

    const existingAccession = await this.bookCopyModel.findOne({ accessionNumber: createDto.accessionNumber }).exec();
    if (existingAccession) throw new BadRequestException('Accession number must be unique');

    if (createDto.barcode) {
      const existingBarcode = await this.bookCopyModel.findOne({ barcode: createDto.barcode }).exec();
      if (existingBarcode) throw new BadRequestException('Barcode must be unique');
    }

    const copy = new this.bookCopyModel({
      bookId: new Types.ObjectId(bookId),
      accessionNumber: createDto.accessionNumber,
      barcode: createDto.barcode,
      condition: createDto.condition,
      status: CopyStatus.AVAILABLE,
      chargeHistory: []
    });

    const saved = await copy.save();
    
    await this.triggerAudit(authorization, actorId, 'COPY_CREATED', saved._id.toString(), null, { accessionNumber: saved.accessionNumber });
    
    return saved;
  }

  async update(authorization: string, id: string, updateDto: UpdateBookCopyDto, actorId: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Copy ID');

    if (updateDto.accessionNumber) {
      const existingAccession = await this.bookCopyModel.findOne({ accessionNumber: updateDto.accessionNumber, _id: { $ne: new Types.ObjectId(id) } }).exec();
      if (existingAccession) throw new BadRequestException('Accession number must be unique');
    }

    if (updateDto.barcode) {
      const existingBarcode = await this.bookCopyModel.findOne({ barcode: updateDto.barcode, _id: { $ne: new Types.ObjectId(id) } }).exec();
      if (existingBarcode) throw new BadRequestException('Barcode must be unique');
    }

    const existing = await this.bookCopyModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException('Copy not found');

    const updated = await this.bookCopyModel.findByIdAndUpdate(id, { $set: updateDto }, { new: true }).exec();
    
    await this.triggerAudit(authorization, actorId, 'COPY_UPDATED', id, existing, updated);

    return updated;
  }

  async updateStatus(authorization: string, id: string, dto: UpdateStatusDto, actorId: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Copy ID');

    const copy = await this.bookCopyModel.findById(id).exec();
    if (!copy) throw new NotFoundException('Copy not found');

    // Protect special statuses from generic updates
    const restricted = [CopyStatus.LOST, CopyStatus.DAMAGED, CopyStatus.ARCHIVED];
    if (restricted.includes(dto.status as CopyStatus)) {
      throw new BadRequestException(`Cannot change status to ${dto.status} via generic status API. Use specific workflow endpoint.`);
    }

    if (restricted.includes(copy.status as CopyStatus)) {
      throw new BadRequestException(`Cannot transition from ${copy.status} via generic status API. Use specific workflow endpoint.`);
    }

    const oldStatus = copy.status;
    copy.status = dto.status;
    const saved = await copy.save();

    await this.triggerAudit(authorization, actorId, 'COPY_STATUS_CHANGED', id, { status: oldStatus }, { status: saved.status });

    return saved;
  }

  async archive(authorization: string, id: string, actorId: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Copy ID');
    
    const copy = await this.bookCopyModel.findById(id).exec();
    if (!copy) throw new NotFoundException('Copy not found');

    if (copy.status === CopyStatus.ARCHIVED) {
      throw new BadRequestException('Copy is already archived');
    }

    const oldStatus = copy.status;
    copy.status = CopyStatus.ARCHIVED;
    const saved = await copy.save();

    await this.triggerAudit(authorization, actorId, 'COPY_ARCHIVED', id, { status: oldStatus }, { status: saved.status });
    
    return saved;
  }

  async reportLostDamaged(authorization: string, id: string, type: 'LOST' | 'DAMAGED', reason: string, actorId: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Copy ID');
    
    const copy = await this.bookCopyModel.findById(id).exec();
    if (!copy) throw new NotFoundException('Copy not found');

    if (copy.status === CopyStatus.ARCHIVED) {
      throw new BadRequestException('Cannot report an archived copy as lost or damaged');
    }
    
    if (copy.status === CopyStatus.LOST || copy.status === CopyStatus.DAMAGED) {
      throw new BadRequestException(`Copy is already marked as ${copy.status}`);
    }

    if (!type || (type !== 'LOST' && type !== 'DAMAGED')) {
      throw new BadRequestException(`Invalid or missing type: must be LOST or DAMAGED`);
    }

    // Fetch config
    let settings;
    try {
      const response = await axios.get(`${this.userServiceUrl}/api/admin/settings`, { headers: { Authorization: authorization } });
      settings = response.data;
    } catch (e: any) {
      throw new ServiceUnavailableException('Failed to fetch charge policy from User Service');
    }

    const chargeAmount = type === 'LOST' 
      ? (settings.lostBookFine ?? 0) 
      : (settings.damagedBookFine ?? 0);

    const oldStatus = copy.status;
    copy.status = type === 'LOST' ? CopyStatus.LOST : CopyStatus.DAMAGED;
    
    const chargeRecord = {
      id: new Types.ObjectId().toString(),
      type: ChargeType.CHARGE,
      amount: chargeAmount,
      reason: reason || `Marked as ${type.toLowerCase()}`,
      workflow: type === 'LOST' ? ChargeWorkflow.LOST : ChargeWorkflow.DAMAGED,
      createdAt: new Date(),
      actorId: actorId
    };

    copy.chargeHistory.push(chargeRecord);
    const saved = await copy.save();

    await this.triggerAudit(authorization, actorId, `COPY_${type}`, id, { status: oldStatus }, { status: saved.status, charge: chargeRecord });

    return saved;
  }

  async reportFound(authorization: string, id: string, reason: string, actorId: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid Copy ID');
    
    const copy = await this.bookCopyModel.findById(id).exec();
    if (!copy) throw new NotFoundException('Copy not found');

    if (copy.status !== CopyStatus.LOST && copy.status !== CopyStatus.DAMAGED) {
      throw new BadRequestException('Only LOST or DAMAGED copies can be reported as found');
    }

    // Find the last charge to reverse
    const relatedWorkflow = copy.status === CopyStatus.LOST ? ChargeWorkflow.LOST : ChargeWorkflow.DAMAGED;
    
    // Calculate total charge to reverse. A real system might be more complex, but here we just append an adjustment.
    // To properly reverse, we take the original charge amount and create a reversal record.
    const lastCharge = [...copy.chargeHistory].reverse().find(ch => ch.workflow === relatedWorkflow && ch.type === ChargeType.CHARGE);
    const reversalAmount = lastCharge ? lastCharge.amount : 0;

    const oldStatus = copy.status;
    copy.status = CopyStatus.AVAILABLE;

    const reversalRecord = {
      id: new Types.ObjectId().toString(),
      type: ChargeType.REVERSAL,
      amount: -reversalAmount,
      reason: reason || `Found after being ${oldStatus.toLowerCase()}`,
      workflow: ChargeWorkflow.FOUND,
      createdAt: new Date(),
      actorId: actorId
    };

    copy.chargeHistory.push(reversalRecord);
    const saved = await copy.save();

    await this.triggerAudit(authorization, actorId, 'COPY_FOUND', id, { status: oldStatus }, { status: saved.status, reversal: reversalRecord });

    return saved;
  }
}
