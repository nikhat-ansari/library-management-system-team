import { Controller, Post, Get, Param, Body, Headers, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CirculationClient } from './circulation.client';

@ApiTags('fines')
@ApiBearerAuth()
@Controller('fines')
export class FinesController {
  constructor(private readonly circulationClient: CirculationClient) {}

  @Get('member/:id')
  @ApiOperation({ summary: 'Get unified fines for a member' })
  async getMemberFines(@Param('id') memberId: string) {
    const [activeLoans, settings] = await Promise.all([
      this.circulationClient.getMemberActiveLoans(memberId),
      this.circulationClient.getSystemSettings()
    ]);
    console.log('Active Loans for member:', activeLoans);
    
    // In this system, fineAmount is persisted only on return.
    // For ACTIVE loans, we must calculate the outstanding fine dynamically for the aggregator.
    const fineRate = settings.fineRate; 
    const fineCap = settings.fineCap;
    const now = new Date();

    const mapped = activeLoans.map((t: any) => {
        let currentFine = t.fineAmount || 0;
        if (t.status === 'ACTIVE' && t.dueDate) {
          const due = new Date(t.dueDate);
          if (due < now) {
             const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24));
             const calculated = daysOverdue * fineRate;
             currentFine += Math.min(calculated, fineCap);
          }
        }
        return { ...t, calculatedFine: currentFine };
    });
    
    console.log('Mapped Loans:', mapped);

    return mapped
      .filter((t: any) => t.calculatedFine - (t.finePaidAmount || 0) - (t.fineWaivedAmount || 0) > 0)
      .map((t: any) => ({
        referenceId: t._id,
        type: 'OVERDUE_FINE',
        amount: t.calculatedFine,
        paidAmount: t.finePaidAmount || 0,
        waivedAmount: t.fineWaivedAmount || 0,
      }));
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pay a fine' })
  async payFine(@Req() req: any, @Body() data: any) {
    if (!data.amount || data.amount <= 0) {
      throw new BadRequestException('Invalid payment amount');
    }
    const actorId = req.user?.id || 'SYSTEM';
    const tx = await this.circulationClient.payFine(actorId, data.referenceId, data.amount);
    return { success: true, amountPaid: data.amount, transactionId: tx._id };
  }

  @Post('waive')
  @ApiOperation({ summary: 'Waive a fine' })
  async waiveFine(@Req() req: any, @Body() data: any) {
    if (!data.reason) {
      throw new BadRequestException('Reason is required for waiver');
    }
    const actorId = req.user?.id || 'SYSTEM';
    const tx = await this.circulationClient.waiveFine(actorId, data.referenceId, data.amount, data.reason);
    return { success: true, amountWaived: data.amount, reason: data.reason, transactionId: tx._id };
  }
}
