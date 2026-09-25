// src/modules/appointment_page_content/appointment_page_content.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AppointmentPageContent,
  AppointmentPageContentSchema,
} from 'src/schema/schema';
import { AppointmentPageContentController } from './appointment_page_content.controller';
import { AppointmentPageContentService } from './appointment_page_content.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppointmentPageContent.name, schema: AppointmentPageContentSchema },
    ]),
  ],
  controllers: [AppointmentPageContentController],
  providers: [AppointmentPageContentService],
})
export class AppointmentPageContentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('appointment_page_content/add', 'appointment_page_content/update/:id');
  }
}
