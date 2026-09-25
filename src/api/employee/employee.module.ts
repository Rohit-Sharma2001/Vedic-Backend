// enquiry_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Employee,
  EmployeeSchema,
  User,
  UserSchema,
  AppointmentManagement,
  AppointmentManagementSchema,
  NonMemberaddressSchema,
  NonMemberaddress
} from '../../schema/schema';

import { EmployeeManagementService } from './employee.services';
import { EmployeeManagementController } from './employee.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: User.name, schema: UserSchema },
      { name: AppointmentManagement.name, schema: AppointmentManagementSchema }, 
      { name: NonMemberaddress.name, schema: NonMemberaddressSchema }, 
    ]),
  ],
  controllers: [EmployeeManagementController],
  providers: [EmployeeManagementService],
})
export class EmployeeManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('employee-management/add', 'employee-management/editEmployee');
  }
}

