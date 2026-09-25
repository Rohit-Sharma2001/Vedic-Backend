// src/modules/lifestyle_pages/lifestyle.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lifestyle,LifestyleSchema } from 'src/schema/schema';
import { LifestyleController } from './lifestyle.controller';
import { LifestyleService } from './lifestyle.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lifestyle.name, schema: LifestyleSchema },
    ]),
  ],
  controllers: [LifestyleController],
  providers: [LifestyleService],
})
export class LifestyleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
   consumer.apply(MulterMiddleware).forRoutes(
  'lifestyle/add',
  'lifestyle/update/:id'
);

  }
}
