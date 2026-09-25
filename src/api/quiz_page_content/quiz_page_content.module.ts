// src/modules/quiz_page_content/quiz_page_content.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizPageContent ,QuizPageContentSchema} from 'src/schema/schema';
import { QuizPageContentController } from './quiz_page_content.controller';
import { QuizPageContentService } from './quiz_page_content.services';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizPageContent.name, schema: QuizPageContentSchema },
    ]),
  ],
  controllers: [QuizPageContentController],
  providers: [QuizPageContentService],
})
export class QuizPageContentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('quiz_page_content/add', 'quiz_page_content/update/:id');
  }
}
