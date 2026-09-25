// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CaseStoryType, CaseStoryTypeSchema } from '../../schema/schema';
import { CaseStoryTypeService } from './case_story_type.service';
import { CaseStoryTypeController } from './case_story_type.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CaseStoryType.name, schema: CaseStoryTypeSchema }]),
  ],
  controllers: [CaseStoryTypeController],
  providers: [CaseStoryTypeService],
})

export class CaseStoryTypeModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('case_story_type/add','case_story_type/update/:id'); // Apply to specific route
  };
}

