// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { LandingPage, LandingPageSchema } from '../../schema/schema';
import { LandingPageService } from './landing_page.service';
import { LandingPageController } from './landing_page.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LandingPage.name, schema: LandingPageSchema }]),
  ],
  controllers: [LandingPageController],
  providers: [LandingPageService],
})

export class LandingPageModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('landing_page/add','landing_page/update/:id'); // Apply to specific route
  };
}

