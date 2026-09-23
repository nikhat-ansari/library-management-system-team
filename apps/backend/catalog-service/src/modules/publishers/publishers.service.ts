import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publisher, PublisherDocument } from './schemas/publisher.schema';

@Injectable()
export class PublishersService {
  constructor(
    @InjectModel(Publisher.name) private readonly publisherModel: Model<PublisherDocument>
  ) {}

  async findAll() {
    return this.publisherModel.find().sort({ name: 1 }).lean().exec();
  }
}
