import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentManagementService } from './appointment_management.service';
import { AppointmentManagementController } from './appointment_management.controller';
import { AppointmentManagementSchema ,AppointmentManagement,ServicesManagement ,ServicesManagementSchema,ServicePrice,ServicePriceSchema,
  Employee,EmployeeSchema , EmployeeReview, EmployeeReviewSchema ,  UserSchema,User,Master,MasterSchema, CenterManagement, CenterManagementSchema,
WaitlistManagement,WaitlistManagementSchema, cartManagement, cartManagementSchema } from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller';


@Module({
   imports: [
      MongooseModule.forFeature([
        { name: AppointmentManagement.name, schema: AppointmentManagementSchema },
        { name: ServicesManagement.name, schema: ServicesManagementSchema },
        { name: ServicePrice.name, schema: ServicePriceSchema },
        { name: Employee.name, schema: EmployeeSchema },
         { name: EmployeeReview.name, schema: EmployeeReviewSchema },  
         { name: User.name, schema: UserSchema }, 
          { name: Master.name, schema: MasterSchema },
          { name: CenterManagement.name, schema: CenterManagementSchema },
        { name: WaitlistManagement.name, schema: WaitlistManagementSchema },
        { name: cartManagement.name, schema: cartManagementSchema },
      ]),
    ],
  controllers: [AppointmentManagementController],
  providers: [AppointmentManagementService],
})
export class AppointmentManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('appointment-management/add', 'appointment-management/update/:id');
  }
}
