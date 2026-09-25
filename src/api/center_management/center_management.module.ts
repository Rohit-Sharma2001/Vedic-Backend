// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CenterManagement, CenterManagementSchema } from '../../schema/schema';
import { CenterManagementService } from './center_management.service';
import { CenterManagementController } from './center_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CenterManagement.name, schema: CenterManagementSchema }]),
  ],
  controllers: [CenterManagementController],
  providers: [CenterManagementService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class CenterManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('center_management/add','center_management/update/:id'); // Apply to specific route
  };
}

