// import { Module } from '@nestjs/common';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema,orderManagement,orderManagementSchema, EventBooking, EventBookingSchema, AppointmentManagementSchema, AppointmentManagement } from '../../schema/schema';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
    MongooseModule.forFeature([{ name: orderManagement.name, schema: orderManagementSchema }]),
    MongooseModule.forFeature([{ name: EventBooking.name, schema: EventBookingSchema }]),
    MongooseModule.forFeature([{ name: AppointmentManagement.name, schema: AppointmentManagementSchema }]),
  ],
  controllers: [CouponController],
  providers: [CouponService],
})
// export class UploadModule implements NestModule {
//   configure = (consumer: MiddlewareConsumer) => {
//     consumer
//       .apply(MulterMiddleware)
//       .forRoutes('product/add'); // Apply to specific route
//   };
// }
export class CouponModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('coupon/add'); // Apply to specific route
  };
}