// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ClinicBanner, ClinicBannerSchema } from '../../schema/schema';
import { ClinicBannerService } from './clinic_banner.service';
import { ClinicBannerController } from './clinic_banner.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ClinicBanner.name, schema: ClinicBannerSchema }]),
  ],
  controllers: [ClinicBannerController],
  providers: [ClinicBannerService],
})

export class ClinicBannerModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('clinic_banner/add','clinic_banner/update/:id'); // Apply to specific route
  };
}

