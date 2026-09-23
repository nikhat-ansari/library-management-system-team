import { Controller, Post, Get, Param, Body, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CirculationClient } from './circulation.client';

@ApiTags('circulation')
@ApiBearerAuth()
@Controller('circulation')
export class CirculationController {
  constructor(private readonly circulationClient: CirculationClient) {}

  @Post('issue')
  @ApiOperation({ summary: 'Issue a book copy to a member' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', example: '60d5ecb74d6bb830b8e70bc9' },
        copyBarcode: { type: 'string', example: 'BC-987654321' }
      },
      required: ['memberId', 'copyBarcode']
    }
  })
  async issueBook(@Req() req: any, @Body() data: any) {
    return this.circulationClient.issueBook(req.headers.authorization as string, req.user?.userId || '', data);
  }

  @Post('return')
  @ApiOperation({ summary: 'Return a book copy' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        copyBarcode: { type: 'string', example: 'BC-987654321' },
        condition: { type: 'string', example: 'LOST', enum: ['LOST', 'DAMAGED'] }
      },
      required: ['copyBarcode']
    }
  })
  async returnBook(@Req() req: any, @Body() data: any) {
    return this.circulationClient.returnBook(req.headers.authorization as string, req.user?.userId || '', data);
  }

  @Post('renew')
  @ApiOperation({ summary: 'Renew an active book loan' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', example: '60d5ecb74d6bb830b8e70bc9' }
      },
      required: ['transactionId']
    }
  })
  async renewBook(@Req() req: any, @Body() data: any) {
    return this.circulationClient.renewBook(req.headers.authorization as string, req.user?.userId || '', data);
  }

  @Get('member/:id/active')
  @ApiOperation({ summary: 'Get active loans for a member' })
  async getMemberActiveLoans(@Param('id') memberId: string) {
    return this.circulationClient.getMemberActiveLoans(memberId);
  }
}
