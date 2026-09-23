import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('api/categories')
@UseGuards(JwtGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }
}
