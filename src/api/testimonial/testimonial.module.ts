// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Testimonial, TestimonialSchema } from '../../schema/schema';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Testimonial.name, schema: TestimonialSchema }]),
  ],
  controllers: [TestimonialController],
  providers: [TestimonialService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class TestimonialModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('testimonial/add'); // Apply to specific route
  };
}