import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YogaClassManagementController } from './yoga_class_management.controller';
import { YogaClassManagement, YogaClassManagementSchema, Master, MasterSchema, Coupon, CouponSchema, yogaClassBooking, yogaClassBookingSchema, User, UserSchema } from 'src/schema/schema';
import { YogaClassManagementService } from './yoga_class_management.services';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YogaClassManagement.name, schema: YogaClassManagementSchema },
      { name: Master.name, schema: MasterSchema },
      { name: Coupon.name, schema: CouponSchema },
      { name: yogaClassBooking.name, schema: yogaClassBookingSchema },
      { name: User.name, schema: UserSchema }
    ]),
  ],
  controllers: [YogaClassManagementController],
  providers: [YogaClassManagementService],
})
export class YogaClassManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('yoga_class_management/add', 'yoga_class_management/update/:id');
  };
}
