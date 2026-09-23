import { Controller, Get, UseGuards } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('api/publishers')
@UseGuards(JwtGuard)
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Get()
  async findAll() {
    return this.publishersService.findAll();
  }
}
