// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Master, MasterSchema, YogaVideos, YogaVideosSchema, MembershipBuyHistroy, MembershipBuyHistroySchema } from '../../schema/schema';
import { YogaVideosService } from './yoga_videos.service';
import { YogaVideoController } from './yoga_videos.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: YogaVideos.name, schema: YogaVideosSchema },
    { name: Master.name, schema: MasterSchema },
    { name: MembershipBuyHistroy.name, schema: MembershipBuyHistroySchema }
    ]),],
  // MongooseModule.forFeature([{ name: Master.name, schema: MasterSchema }]),],
  controllers: [YogaVideoController],
  providers: [YogaVideosService],
})

export class YogaVideoModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('yoga_videos/addYogaVideo', 'yoga_videos/updateVideoDetails/:id'); // Apply to specific route
  };
}

