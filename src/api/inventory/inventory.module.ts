// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema, Master, MasterSchema ,review, reviewSchema} from '../../schema/schema';
import { ProductService } from './inventory.service';
import { ProductController } from './inventory.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Master.name, schema: MasterSchema },
      { name: review.name, schema: reviewSchema }
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class ProductModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('product/add','product/add-review','product/update/:id'); 
  };
}


