// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogManagement, BlogManagementSchema,BlogContentManagement,BlogContentManagementSchema } from '../../schema/schema';
import { BlogManagementService } from './blog_management.service';
import { BlogManagementController } from './blog_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogManagement.name, schema: BlogManagementSchema },
      { name: BlogContentManagement.name, schema: BlogContentManagementSchema }
    ]),
  ],
  controllers: [BlogManagementController],
  providers: [BlogManagementService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class BlogManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('blog_management/add','blog_management/update/:id','blog_management/addContent','blog_management/updateContent/:id'); // Apply to specific route
  };
}

