import { Controller, Get, Post, Patch, Param, Body, Query, Headers, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BooksClient } from './books.client';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBookDto } from '../../../../catalog-service/src/modules/books/dto/create-book.dto';
import { UpdateBookDto } from '../../../../catalog-service/src/modules/books/dto/update-book.dto';
import { BookQueryDto } from '../../../../catalog-service/src/modules/books/dto/book-query.dto';
import { MetadataSuggestionDto, DuplicateCheckDto } from '../../../../catalog-service/src/modules/books/dto/books-ai.dto';

@ApiTags('books')
@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private readonly booksClient: BooksClient) {}

  @Get()
  @ApiOperation({ summary: 'List and search books' })
  @ApiResponse({ status: 200, description: 'List of books retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Forbidden - User lacks LIBRARIAN_STAFF role' })
  async findAll(@Req() req: Request, @Query() query: BookQueryDto) {
    return this.booksClient.findAll(req.headers.authorization as string, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or Duplicate ISBN' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Req() req: Request, @Body() data: CreateBookDto) {
    return this.booksClient.create(req.headers.authorization as string, data);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export books catalog' })
  @ApiResponse({ status: 200, description: 'Catalog exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async exportCatalogue(@Req() req: Request) {
    return this.booksClient.exportCatalogue(req.headers.authorization as string);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', description: 'MongoDB ID of the book', type: String })
  @ApiResponse({ status: 200, description: 'Book retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return this.booksClient.findOne(req.headers.authorization as string, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  @ApiParam({ name: 'id', description: 'MongoDB ID of the book', type: String })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Req() req: Request, @Param('id') id: string, @Body() data: UpdateBookDto) {
    return this.booksClient.update(req.headers.authorization as string, id, data);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import books via CSV or Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or Excel file containing books data'
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Bulk import processed' })
  @ApiResponse({ status: 400, description: 'Invalid file format or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @UseInterceptors(FileInterceptor('file'))
  async importBulk(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.booksClient.importBulk(req.headers.authorization as string, file);
  }

  @Post('ai/metadata-suggestion')
  @ApiOperation({ summary: 'Get AI metadata suggestions' })
  @ApiResponse({ status: 200, description: 'AI suggestion retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async suggestMetadata(@Req() req: Request, @Body() data: MetadataSuggestionDto) {
    return this.booksClient.suggestMetadata(req.headers.authorization as string, data);
  }

  @Post('ai/duplicate-check')
  @ApiOperation({ summary: 'Check for potential duplicates (AI assisted)' })
  @ApiResponse({ status: 200, description: 'Duplicate check completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkDuplicates(@Req() req: Request, @Body() data: DuplicateCheckDto) {
    return this.booksClient.checkDuplicates(req.headers.authorization as string, data);
  }
}
