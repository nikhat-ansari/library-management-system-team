import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument, TransactionStatus } from '../../schemas/transaction.schema';
import { UserServiceClient } from './user-service.client';
import { CatalogServiceClient } from './catalog-service.client';
import { IssueBookDto, ReturnBookDto, RenewBookDto } from './dto/circulation.dto';

@Injectable()
export class CirculationService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    private readonly userServiceClient: UserServiceClient,
    private readonly catalogServiceClient: CatalogServiceClient,
  ) {}

  private calculateDueDate(issueDate: Date, loanPeriodDays: number, holidays: string[]): Date {
    // Very simple implementation: add days, if it lands on a holiday, add another day.
    const date = new Date(issueDate);
    date.setDate(date.getDate() + loanPeriodDays);
    
    // We check if the due date lands on a holiday
    while (holidays.includes(date.toISOString().split('T')[0])) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  }

  async issueBook(authorization: string, actorId: string, dto: IssueBookDto) {
    // 1. Verify Member
    const member = await this.userServiceClient.findMemberById(dto.memberId);
    if (!member || member.status !== 'active') {
      throw new BadRequestException('Member is not active or not found');
    }

    // 2. Get Settings
    const settings = await this.userServiceClient.getSystemSettings();
    const holidays = await this.userServiceClient.getHolidays();

    // 3. Check Borrowing Limit
    const activeLoans = await this.transactionModel.countDocuments({
      memberId: new Types.ObjectId(dto.memberId),
      status: TransactionStatus.ACTIVE,
    }).exec();

    if (activeLoans >= settings.borrowingLimit) {
      throw new BadRequestException(`Member has reached borrowing limit of ${settings.borrowingLimit}`);
    }

    // 4. Find Copy
    const copy = await this.catalogServiceClient.findCopyByBarcode(authorization, dto.copyBarcode);
    if (copy.status !== 'Available') {
      throw new BadRequestException(`Book copy is currently ${copy.status}`);
    }

    // 5. Compensation / Saga Pattern
    // First update catalog to Issued
    await this.catalogServiceClient.updateCopyStatus(authorization, actorId, copy._id, 'Issued');

    const issueDate = new Date();
    const dueDate = this.calculateDueDate(issueDate, settings.loanPeriod, holidays);

    try {
      // Create Transaction
      const transaction = new this.transactionModel({
        memberId: new Types.ObjectId(dto.memberId),
        bookId: new Types.ObjectId(copy.bookId),
        copyId: new Types.ObjectId(copy._id),
        issueDate,
        dueDate,
        status: TransactionStatus.ACTIVE,
      });

      const saved = await transaction.save();
      return saved;
    } catch (error) {
      // Compensate: Revert catalog status back to Available
      console.error('Failed to save transaction, rolling back copy status', error);
      await this.catalogServiceClient.updateCopyStatus(authorization, actorId, copy._id, 'Available');
      throw new InternalServerErrorException('Failed to complete issue transaction: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  async returnBook(authorization: string, actorId: string, dto: ReturnBookDto) {
    const copy = await this.catalogServiceClient.findCopyByBarcode(authorization, dto.copyBarcode);

    const transaction = await this.transactionModel.findOne({
      copyId: new Types.ObjectId(copy._id),
      status: TransactionStatus.ACTIVE,
    }).exec();

    if (!transaction) {
      throw new BadRequestException('No active loan found for this copy');
    }

    const returnDate = new Date();
    let isOverdue = false;
    let fineAmount = 0;

    if (returnDate > transaction.dueDate) {
      isOverdue = true;
      const settings = await this.userServiceClient.getSystemSettings();
      const daysOverdue = Math.floor((returnDate.getTime() - transaction.dueDate.getTime()) / (1000 * 3600 * 24));
      fineAmount = Math.min(daysOverdue * settings.fineRate, settings.fineCap);
    }

    const nextStatus = dto.condition === 'LOST' ? 'Lost' : dto.condition === 'DAMAGED' ? 'Damaged' : 'Available';
    const txnStatus = dto.condition === 'LOST' ? TransactionStatus.LOST : dto.condition === 'DAMAGED' ? TransactionStatus.DAMAGED : TransactionStatus.RETURNED;

    if (dto.condition === 'LOST' || dto.condition === 'DAMAGED') {
      await this.catalogServiceClient.reportLostDamaged(authorization, actorId, copy._id, dto.condition, 'Reported during return');
    } else {
      await this.catalogServiceClient.updateCopyStatus(authorization, actorId, copy._id, nextStatus);
    }

    transaction.status = txnStatus;
    transaction.returnDate = returnDate;
    transaction.fineAmount = fineAmount;
    
    await transaction.save();
    return transaction;
  }

  async renewBook(authorization: string, actorId: string, dto: RenewBookDto) {
    const transaction = await this.transactionModel.findById(dto.transactionId).exec();
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.status !== TransactionStatus.ACTIVE) throw new BadRequestException('Only active loans can be renewed');

    const member = await this.userServiceClient.findMemberById(transaction.memberId.toString());
    if (!member || member.status !== 'active') throw new BadRequestException('Member is not active');

    // Here we can check renewal limits. The prompt implies there are renewal limits.
    // If not in settings, assume max 1 for now or check settings if we add it.
    if (transaction.renewalCount >= 2) {
      throw new BadRequestException('Renewal limit reached');
    }

    const settings = await this.userServiceClient.getSystemSettings();
    const holidays = await this.userServiceClient.getHolidays();

    // Calculate new due date from CURRENT due date, not today, unless policy dictates otherwise.
    // Standard library policy usually adds from current due date.
    const newDueDate = this.calculateDueDate(transaction.dueDate, settings.loanPeriod, holidays);

    transaction.dueDate = newDueDate;
    transaction.renewalCount += 1;
    transaction.renewalHistory.push(new Date());

    await transaction.save();
    return transaction;
  }

  async getMemberActiveLoans(memberId: string) {
    if (!Types.ObjectId.isValid(memberId)) throw new BadRequestException('Invalid member ID');
    
    // Auto-calculates overdue using virtuals
    const transactions = await this.transactionModel.find({
      memberId: new Types.ObjectId(memberId),
      status: TransactionStatus.ACTIVE
    }).populate('copyId bookId').exec();

    // Add virtuals to response
    return transactions.map(t => t.toJSON());
  }
}
