// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { faqManagement, faqManagementSchema ,faqs,faqsSchema} from '../../schema/schema';
import { FaqManagementService } from './faq_management.services';
import { FaqManagementController } from './faq_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: faqManagement.name, schema: faqManagementSchema },
        { name: faqs.name, schema: faqsSchema }
    ]),
  ],
  controllers: [FaqManagementController],
  providers: [FaqManagementService],
})

export class FaqManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('faq_management/add','faq_management/update','faq_management/addOne'); // Apply to specific route
  };
}