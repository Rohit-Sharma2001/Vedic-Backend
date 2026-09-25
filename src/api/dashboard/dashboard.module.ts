import { Module,NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import {
  User,
  UserSchema,
  orderManagement,
  orderManagementSchema,
  AppointmentManagement,
  AppointmentManagementSchema,
  MembershipBuyHistroy,
  MembershipBuyHistroySchema,
  Donation,
  DonationSchema,
  cartManagement,
  cartManagementSchema,
  Employee,
  EmployeeSchema,
  yogaClassBooking,
  yogaClassBookingSchema,
  EventBooking,
  EventBookingSchema,
  WaitlistManagement,
  WaitlistManagementSchema,
  MembershipManagement,
  MembershipManagementSchema,
  EventManagement,
  EventManagementSchema,
  YogaClassManagement,
  YogaClassManagementSchema,
} from '../../schema/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: orderManagement.name, schema: orderManagementSchema },
      { name: AppointmentManagement.name, schema: AppointmentManagementSchema },
      { name: MembershipBuyHistroy.name, schema: MembershipBuyHistroySchema },
      { name: Donation.name, schema: DonationSchema },
      { name: cartManagement.name, schema: cartManagementSchema },
      { name: Employee.name, schema: EmployeeSchema },
      { name: yogaClassBooking.name, schema: yogaClassBookingSchema },
      { name: EventBooking.name, schema: EventBookingSchema },
      { name: WaitlistManagement.name, schema: WaitlistManagementSchema },
      { name: MembershipManagement.name, schema: MembershipManagementSchema },
      { name: EventManagement.name, schema: EventManagementSchema },
      { name: YogaClassManagement.name, schema: YogaClassManagementSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {

    configure = (consumer: MiddlewareConsumer) => {
        consumer
          .apply(MulterMiddleware)
          .forRoutes();
      };
}
