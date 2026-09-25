import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
})
export class UploadModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('upload/file'); // Apply to specific route
  };
}
