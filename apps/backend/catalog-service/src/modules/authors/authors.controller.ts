import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('api/authors')
@UseGuards(JwtGuard)
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  async findAll() {
    return this.authorsService.findAll();
  }
}
