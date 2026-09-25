// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AmitaProjectSection, AmitaProjectSectionSchema } from '../../schema/schema';
import { AmitaProjectSectionService } from './amita_project_section.service';
import { AmitaProjectSectionController } from './amita_project_section.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AmitaProjectSection.name, schema: AmitaProjectSectionSchema }]),
  ],
  controllers: [AmitaProjectSectionController],
  providers: [AmitaProjectSectionService],
})

export class AmitaProjectSectionModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('amita_project_section/add','amita_project_section/update/:id'); // Apply to specific route
  };
}

