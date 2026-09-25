// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { cartManagement, cartManagementSchema, Product, ProductSchema, } from '../../schema/schema';
import { cartManagementService } from './cart_management.service';
import { CartManagementController } from './cart_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: cartManagement.name, schema: cartManagementSchema },
    { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [CartManagementController],
  providers: [cartManagementService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class CartManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
    //   .forRoutes('cart_management/add','cart_management/update/:id'); // Apply to specific route
  };
}

