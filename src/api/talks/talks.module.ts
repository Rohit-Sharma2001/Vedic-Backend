// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Talks, TalksSchema } from '../../schema/schema';
import { TalksService } from './talks.service';
import { TalksController } from './talks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Talks.name, schema: TalksSchema }]),
  ],
  controllers: [TalksController],
  providers: [TalksService],
})

export class TalksModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('talks/add','talks/update/:id'); // Apply to specific route
  };
}

