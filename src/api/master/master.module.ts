// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Master, MasterSchema , suscribe, suscribeSchema,Product,ProductSchema} from '../../schema/schema';
import { MasterService } from './master.service';
import { MasterController } from './master.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Master.name, schema: MasterSchema },
      { name: Product.name, schema: ProductSchema },
      { name: suscribe.name, schema: suscribeSchema }
    ]),
  ],
  controllers: [MasterController],
  providers: [MasterService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class MasterModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('master/add','master/update/:id'); // Apply to specific route
  };
}