import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AmitaJainLandingPageService } from './amitajain_landingpage.service';
import { AmitaJainLandingPageController } from './amitajain_landingpage.controller';
import { AmitaJainLandingPageSchema ,AmitaJainLandingPageDetails} from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AmitaJainLandingPageDetails.name, schema: AmitaJainLandingPageSchema },
    ]),
  ],
  controllers: [AmitaJainLandingPageController],
  providers: [AmitaJainLandingPageService],
})
export class AmitaJainLandingPageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
  .apply(MulterMiddleware)
  .forRoutes('amitajain_landingpage/add','amitajain_landingpage/update');

  }
}
