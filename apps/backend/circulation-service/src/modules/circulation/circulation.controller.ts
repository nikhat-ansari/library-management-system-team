import { Controller, Post, Body, Headers, Get, Param } from '@nestjs/common';
import { CirculationService } from './circulation.service';
import { IssueBookDto, ReturnBookDto, RenewBookDto } from './dto/circulation.dto';

@Controller('api/internal/circulation')
export class CirculationController {
  constructor(private readonly circulationService: CirculationService) {}

  @Post('issue')
  async issueBook(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Body() dto: IssueBookDto,
  ) {
    return this.circulationService.issueBook(auth, actorId || 'SYSTEM', dto);
  }

  @Post('return')
  async returnBook(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Body() dto: ReturnBookDto,
  ) {
    return this.circulationService.returnBook(auth, actorId || 'SYSTEM', dto);
  }

  @Post('renew')
  async renewBook(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Body() dto: RenewBookDto,
  ) {
    return this.circulationService.renewBook(auth, actorId || 'SYSTEM', dto);
  }

  @Get('member/:id/active')
  async getMemberActiveLoans(@Param('id') memberId: string) {
    return this.circulationService.getMemberActiveLoans(memberId);
  }
}
