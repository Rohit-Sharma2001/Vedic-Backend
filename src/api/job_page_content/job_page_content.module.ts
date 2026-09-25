// src/modules/job_page_content/job_page_content.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobPageContent , JobPageContentSchema} from 'src/schema/schema';
import { JobPageContentController } from './job_page_content.controller';
import { JobPageContentService } from './job_page_content.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobPageContent.name, schema: JobPageContentSchema },
    ]),
  ],
  controllers: [JobPageContentController],
  providers: [JobPageContentService],
})
export class JobPageContentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('job_page_content/add', 'job_page_content/update/:id');
  }
}
