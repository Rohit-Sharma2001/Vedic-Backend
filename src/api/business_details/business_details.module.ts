// File: src/modules/business_detail/business_detail.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessDetailController } from './business_details.controller';
import { BusinessDetailService } from './business_details.services';
import { BusinessDetail ,BusinessDetailSchema} from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BusinessDetail.name, schema: BusinessDetailSchema }]),
  ],
  controllers: [BusinessDetailController],
  providers: [BusinessDetailService],
})
export class BusinessDetailModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MulterMiddleware).forRoutes(
      'business_detail/add',
      'business_detail/update/:id',
    );
  }
}