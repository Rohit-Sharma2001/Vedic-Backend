// src/modules/our_family_banner/our_family_banner.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OurFamilyBanner ,OurFamilyBannerSchema} from 'src/schema/schema';
import { OurFamilyBannerController } from './our_family_banner.controller';
import { OurFamilyBannerService } from './our_family_banner.service';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OurFamilyBanner.name, schema: OurFamilyBannerSchema },
    ]),
  ],
  controllers: [OurFamilyBannerController],
  providers: [OurFamilyBannerService],
})
export class OurFamilyBannerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('our_family_banner/add', 'our_family_banner/update/:id');
  }
}
