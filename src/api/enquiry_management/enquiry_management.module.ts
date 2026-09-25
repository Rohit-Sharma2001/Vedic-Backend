// enquiry_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Enquiry, EnquirySchema } from '../../schema/schema';
import { EnquiryManagementService } from './enquiry_management.services';
import { EnquiryManagementController } from './enquiry_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Enquiry.name, schema: EnquirySchema }]),
  ],
  controllers: [EnquiryManagementController],
  providers: [EnquiryManagementService],
})
export class EnquiryManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('enquiry_management/add', 'enquiry_management/update');
  }
}
