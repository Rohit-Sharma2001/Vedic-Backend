// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { YogaClasses, YogaClassesSchema } from '../../schema/schema';
import { YogaClassesService } from './yoga_classes.service';
import { YogaClassesController } from './yoga_classes.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: YogaClasses.name, schema: YogaClassesSchema }]),
  ],
  controllers: [YogaClassesController],
  providers: [YogaClassesService],
})

export class YogaClassesModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('yoga_classes/add','yoga_classes/update/:id'); // Apply to specific route
  };
}

