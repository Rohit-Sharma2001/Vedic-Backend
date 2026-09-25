// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactManagement, ContactManagementSchema } from '../../schema/schema';
import { ContactManagementService } from './contact_management.service';
import { ContactManagementController } from './contact_management.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactManagement.name, schema: ContactManagementSchema }]),
  ],
  controllers: [ContactManagementController],
  providers: [ContactManagementService],
})

export class ContactManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('contact_management/add','contact_management/update/:id'); // Apply to specific route
  };
}

