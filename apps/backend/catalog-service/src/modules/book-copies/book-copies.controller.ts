import { Controller, Get, Post, Patch, Delete, Param, Body, Headers } from '@nestjs/common';
import { BookCopiesService } from './book-copies.service';
import { CreateBookCopyDto } from './dto/create-book-copy.dto';
import { UpdateBookCopyDto } from './dto/update-book-copy.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { LostDamagedDto, FoundDto } from './dto/workflow.dto';
import { ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('book-copies')
@Controller('api')
@UseGuards(JwtGuard, RolesGuard)
@Roles('LIBRARIAN_STAFF')
export class BookCopiesController {
  constructor(private readonly bookCopiesService: BookCopiesService) {}

  @Get('books/:bookId/copies')
  findByBookId(@Param('bookId') bookId: string) {
    return this.bookCopiesService.findByBookId(bookId);
  }

  @Get('internal/book-copies/barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.bookCopiesService.findByBarcode(barcode);
  }

  @Get('internal/book-copies/:id')
  findById(@Param('id') id: string) {
    return this.bookCopiesService.findById(id);
  }

  @Post('books/:bookId/copies')
  create(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string, // passed from API gateway
    @Param('bookId') bookId: string,
    @Body() createDto: CreateBookCopyDto,
  ) {
    return this.bookCopiesService.create(auth, bookId, createDto, actorId || 'SYSTEM');
  }

  @Patch('book-copies/:id')
  update(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateBookCopyDto,
  ) {
    return this.bookCopiesService.update(auth, id, updateDto, actorId || 'SYSTEM');
  }

  @Patch('book-copies/:id/status')
  updateStatus(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateStatusDto,
  ) {
    return this.bookCopiesService.updateStatus(auth, id, updateDto, actorId || 'SYSTEM');
  }

  @Post('book-copies/:id/lost-damaged')
  reportLostDamaged(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Param('id') id: string,
    @Body() body: LostDamagedDto & { type: 'LOST' | 'DAMAGED' },
  ) {
    return this.bookCopiesService.reportLostDamaged(auth, id, body.type, body.reason || '', actorId || 'SYSTEM');
  }

  @Post('book-copies/:id/found')
  reportFound(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Param('id') id: string,
    @Body() body: FoundDto,
  ) {
    return this.bookCopiesService.reportFound(auth, id, body.reason || '', actorId || 'SYSTEM');
  }
  
  @Delete('book-copies/:id')
  archive(
    @Headers('authorization') auth: string,
    @Headers('x-user-id') actorId: string,
    @Param('id') id: string,
  ) {
    return this.bookCopiesService.archive(auth, id, actorId || 'SYSTEM');
  }
}
