import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventManagementController } from './event_management.controller';
import { EventManagement, EventManagementSchema, Master, MasterSchema, Coupon, CouponSchema, EventBooking, EventBookingSchema, User, UserSchema } from 'src/schema/schema';
import { EventManagementService } from './event_management.services';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventManagement.name, schema: EventManagementSchema },
      { name: Master.name, schema: MasterSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: EventBooking.name, schema: EventBookingSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [EventManagementController],
  providers: [EventManagementService],
})
export class EventManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('event_management/add', 'event_management/update/:id');
  };
}
