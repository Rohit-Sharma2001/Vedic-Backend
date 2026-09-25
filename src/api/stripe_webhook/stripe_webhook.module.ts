import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { orderManagement, orderManagementSchema, cartManagement, cartManagementSchema, Product, ProductSchema, Coupon, CouponSchema, address, addressSchema, CenterManagement, CenterManagementSchema, Master, MasterSchema, MembershipManagement, MembershipManagementSchema,AppointmentManagement,AppointmentManagementSchema, CourseManagement, CourseManagementSchema, MembershipBuyHistroy,MembershipBuyHistroySchema } from '../../schema/schema';
import { StripeWebhookController } from './stripe_webhook.controller';
import { StripeWebhookService } from './stripe_webhook.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: orderManagement.name, schema: orderManagementSchema },
    { name: cartManagement.name, schema: cartManagementSchema },
    { name: Product.name, schema: ProductSchema },
    { name: Coupon.name, schema: CouponSchema },
    { name: address.name, schema: addressSchema },
    { name: CenterManagement.name, schema: CenterManagementSchema },
    { name: Master.name, schema: MasterSchema },
    { name: MembershipManagement.name, schema: MembershipManagementSchema },
    {name:AppointmentManagement.name,schema:AppointmentManagementSchema},
    {name:CourseManagement.name,schema:CourseManagementSchema},
    {name:MembershipBuyHistroy.name,schema:MembershipBuyHistroySchema},
    ])
  ],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService]
})
// export class OrderManagementModule {}

export class StripeWebhookModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
    //   .forRoutes('cart_management/add','cart_management/update/:id'); // Apply to specific route
  };
}
