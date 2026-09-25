import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { orderManagement, orderManagementSchema, cartManagement, cartManagementSchema, Product, ProductSchema, Coupon, CouponSchema, address, addressSchema,
   CenterManagement, CenterManagementSchema, Master, MasterSchema, MembershipManagement, MembershipManagementSchema, MembershipBuyHistroy, MembershipBuyHistroySchema, User, UserSchema, AppointmentManagement,AppointmentManagementSchema, 
   Employee,   EmployeeSchema} from '../../schema/schema';
import { OrderManagementController } from './order_management.controller';
import { OrderManagementService } from './order_management.service';

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
    { name: MembershipBuyHistroy.name, schema: MembershipBuyHistroySchema },
    { name: User.name, schema: UserSchema },
    { name: AppointmentManagement.name, schema: AppointmentManagementSchema },
    { name: Employee.name, schema: EmployeeSchema },
    ])
  ],
  controllers: [OrderManagementController],
  providers: [OrderManagementService]
})
// export class OrderManagementModule {}

export class OrderManagementModule implements NestModule {
  configure = (consumer: MiddlewareConsumer) => {
    consumer
      .apply(MulterMiddleware)
    //   .forRoutes('cart_management/add','cart_management/update/:id'); // Apply to specific route
  };
}
