// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { YogaClassesPageContent, YogaClassesPageContentSchema } from '../../schema/schema';
import { YogaClassesPageContentService } from './yoga_class_content.service';
import { YogaClassesPageContentController } from './yoga_class_content.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: YogaClassesPageContent.name, schema: YogaClassesPageContentSchema }]),
  ],
  controllers: [YogaClassesPageContentController],
  providers: [YogaClassesPageContentService],
})

export class YogaClassesPageContentModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('yoga_classes_content/add','yoga_classes_content/update/:id'); // Apply to specific route
  };
}

