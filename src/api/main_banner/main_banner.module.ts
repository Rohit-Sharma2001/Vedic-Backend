
// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MainBanner, MainBannerSchema } from '../../schema/schema';
import { MainBannerService } from './main_banner.service';
import { MainBannerController } from './main_banner.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MainBanner.name, schema: MainBannerSchema }]),
  ],
  controllers: [MainBannerController],
  providers: [MainBannerService],
})


export class MainBannerModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('main_banner/add','main_banner/update/:id'); // Apply to specific route
  };
}