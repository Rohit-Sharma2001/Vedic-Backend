// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticleManagement, ArticleManagementSchema } from '../../schema/schema';
import { ArticleManagementService } from './article_management.service';
import { ArticleManagementController } from './article_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ArticleManagement.name, schema: ArticleManagementSchema }]),
  ],
  controllers: [ArticleManagementController],
  providers: [ArticleManagementService],
})

export class ArticleManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('article_management/add','article_management/update/:id','article_management/increment-viewcount/:id'); // Apply to specific route
  };
}

