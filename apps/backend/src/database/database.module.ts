import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    const uri = process.env.MONGODB_URI;
    return uri
      ? { module: DatabaseModule, imports: [MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('mongodbUri') }) })] }
      : { module: DatabaseModule };
  }
}
