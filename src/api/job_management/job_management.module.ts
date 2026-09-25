// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JobApplication, JobApplicationSchema, JobManagement, JobManagementSchema } from '../../schema/schema';
import { JobManagementService } from './job_management.service';
import { JobManagementController } from './job_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobManagement.name, schema: JobManagementSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
    ]),
  ],
  controllers: [JobManagementController],
  providers: [JobManagementService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class JobManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('job_management/add'); // Apply to specific route
  };
}