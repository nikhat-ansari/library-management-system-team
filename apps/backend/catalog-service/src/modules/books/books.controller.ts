import { Controller, Get, Post, Patch, Param, Body, Query, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookQueryDto } from './dto/book-query.dto';
import { MetadataSuggestionDto, DuplicateCheckDto } from './dto/books-ai.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/books')
@UseGuards(JwtGuard, RolesGuard)
@Roles('LIBRARIAN_STAFF')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async findAll(@Query() query: BookQueryDto) {
    return this.booksService.findAll(query);
  }

  @Post()
  async create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get('export')
  async export() {
    return this.booksService.exportCatalogue();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importBulk(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return this.booksService.importBulk(file);
  }

  @Post('ai/metadata-suggestion')
  async suggestMetadata(@Body() body: MetadataSuggestionDto) {
    return this.booksService.suggestMetadata(body.title, body.isbn);
  }

  @Post('ai/duplicate-check')
  async checkDuplicates(@Body() body: DuplicateCheckDto) {
    return this.booksService.checkDuplicates(body.title, body.isbn);
  }
}
