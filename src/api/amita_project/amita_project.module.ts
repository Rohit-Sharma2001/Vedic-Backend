// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AmitaProject, AmitaProjectSchema } from '../../schema/schema';
import { AmitaProjectService } from './amita_project.service';
import { AmitaProjectController } from './amita_project.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AmitaProject.name, schema: AmitaProjectSchema }]),
  ],
  controllers: [AmitaProjectController],
  providers: [AmitaProjectService],
})

export class AmitaProjectModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('amita_project/add','amita_project/update/:id'); // Apply to specific route
  };
}

