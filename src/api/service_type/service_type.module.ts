// File: service_type.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServiceTypeController } from './service_type.controller';
import { ServiceTypeService } from './service_type.service';
import { ServiceType,ServiceTypeSchema } from 'src/schema/schema';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServiceType.name, schema: ServiceTypeSchema }]),
  ],
  controllers: [ServiceTypeController],
  providers: [ServiceTypeService],
})
export class ServiceTypeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MulterMiddleware).forRoutes(
      'service_type/add',
      'service_type/update/:id',
    );
  }
}
