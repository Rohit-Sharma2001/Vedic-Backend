// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CaseStoryProvider, CaseStoryProviderSchema } from '../../schema/schema';
import { CaseStoryProviderService } from './case_story_provider.service';
import { CaseStoryProviderController } from './case_story_provider.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CaseStoryProvider.name, schema: CaseStoryProviderSchema }]),
  ],
  controllers: [CaseStoryProviderController],
  providers: [CaseStoryProviderService],
})

export class CaseStoryProviderModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
     .apply(MulterMiddleware)
.forRoutes('case_story_provider/add', 'case_story_provider/update/:id');

  };
}

