// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from '../../schema/schema';
import { ArticleService } from './article_contentmanagement.service';
import { ArticleController } from './article_contentmanagement.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})

export class ArticleModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('article_content/add','article_content/update/:id'); // Apply to specific route
  };
}

