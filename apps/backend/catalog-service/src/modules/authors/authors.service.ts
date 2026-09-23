import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Author, AuthorDocument } from './schemas/author.schema';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectModel(Author.name) private readonly authorModel: Model<AuthorDocument>
  ) {}

  async findAll() {
    return this.authorModel.find().sort({ name: 1 }).lean().exec();
  }
}
