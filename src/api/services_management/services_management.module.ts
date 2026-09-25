// File: services_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicesManagementController } from './services_management.controller';
import { ServicesManagementService } from './services_management.service';
import { ServicesManagement ,ServicesManagementSchema,  Employee, EmployeeSchema, AddOns, AddOnsSchema, CenterResources, CenterResourcesSchema,ServicePrice,ServicePriceSchema} from 'src/schema/schema';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServicesManagement.name, schema: ServicesManagementSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: AddOns.name, schema: AddOnsSchema },
      { name: CenterResources.name, schema: CenterResourcesSchema },
      { name: ServicePrice.name, schema: ServicePriceSchema },
    ]),
  ],
  controllers: [ServicesManagementController],
  providers: [ServicesManagementService],
})
export class ServicesManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MulterMiddleware).forRoutes(
      'services_management/add',
      'services_management/update/:id'
    );
  }
}
