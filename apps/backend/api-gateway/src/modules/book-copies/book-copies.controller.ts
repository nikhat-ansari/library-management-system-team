import { Controller, Get, Post, Patch, Delete, Param, Body, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BookCopiesClient } from './book-copies.client';
import { Request } from 'express';
import { CreateBookCopyDto } from '../../../../catalog-service/src/modules/book-copies/dto/create-book-copy.dto';
import { UpdateBookCopyDto } from '../../../../catalog-service/src/modules/book-copies/dto/update-book-copy.dto';
import { UpdateStatusDto } from '../../../../catalog-service/src/modules/book-copies/dto/update-status.dto';
import { LostDamagedDto, FoundDto } from '../../../../catalog-service/src/modules/book-copies/dto/workflow.dto';

@ApiTags('book-copies')
@ApiBearerAuth()
@Controller()
export class BookCopiesController {
  constructor(private readonly bookCopiesClient: BookCopiesClient) {}

  @Get('books/:bookId/copies')
  @ApiOperation({ summary: 'List physical copies of a book' })
  @ApiResponse({ status: 200, description: 'List retrieved successfully' })
  async findByBookId(@Req() req: any, @Param('bookId') bookId: string) {
    return this.bookCopiesClient.findByBookId(req.headers.authorization as string, bookId);
  }

  @Post('books/:bookId/copies')
  @ApiOperation({ summary: 'Add a physical copy to a book' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessionNumber: { type: 'string', example: 'ACC-2023-001' },
        barcode: { type: 'string', example: 'BC-987654321' },
        condition: { type: 'string', example: 'New' }
      },
      required: ['accessionNumber']
    }
  })
  async create(@Req() req: any, @Param('bookId') bookId: string, @Body() data: CreateBookCopyDto) {
    return this.bookCopiesClient.create(req.headers.authorization as string, req.user?.userId || '', bookId, data);
  }

  @Patch('book-copies/:id')
  @ApiOperation({ summary: 'Edit copy details' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accessionNumber: { type: 'string', example: 'ACC-2023-001' },
        barcode: { type: 'string', example: 'BC-987654321' },
        condition: { type: 'string', example: 'Good (minor wear)' }
      }
    }
  })
  async update(@Req() req: any, @Param('id') id: string, @Body() data: UpdateBookCopyDto) {
    return this.bookCopiesClient.update(req.headers.authorization as string, req.user?.userId || '', id, data);
  }

  @Patch('book-copies/:id/status')
  @ApiOperation({ summary: 'Change allowed copy status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'Issued', enum: ['Available', 'Issued', 'Reserved', 'Maintenance'] }
      },
      required: ['status']
    }
  })
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() data: UpdateStatusDto) {
    return this.bookCopiesClient.updateStatus(req.headers.authorization as string, req.user?.userId || '', id, data);
  }

  @Post('book-copies/:id/lost-damaged')
  @ApiOperation({ summary: 'Apply lost/damaged workflow' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'LOST', enum: ['LOST', 'DAMAGED'] },
        reason: { type: 'string', example: 'Reported lost by patron' }
      },
      required: ['type']
    }
  })
  async reportLostDamaged(@Req() req: any, @Param('id') id: string, @Body() data: LostDamagedDto & { type: 'LOST' | 'DAMAGED' }) {
    return this.bookCopiesClient.reportLostDamaged(req.headers.authorization as string, req.user?.userId || '', id, data);
  }

  @Post('book-copies/:id/found')
  @ApiOperation({ summary: 'Restore found-copy status and adjust charge' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Found behind shelf' }
      }
    }
  })
  async reportFound(@Req() req: any, @Param('id') id: string, @Body() data: FoundDto) {
    return this.bookCopiesClient.reportFound(req.headers.authorization as string, req.user?.userId || '', id, data);
  }

  @Delete('book-copies/:id')
  @ApiOperation({ summary: 'Archive a copy' })
  async archive(@Req() req: any, @Param('id') id: string) {
    return this.bookCopiesClient.archive(req.headers.authorization as string, req.user?.userId || '', id);
  }
}
