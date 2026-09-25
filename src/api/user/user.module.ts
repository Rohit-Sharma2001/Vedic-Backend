import { Module } from '@nestjs/common';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller'; // ✅ add
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, smsOtp, smsOtpSchema, emailOtp, emailOtpSchema, address, addressSchema, MembershipBuyHistroy, MembershipBuyHistroySchema, RoleTable,
  RoleTableSchema, RoleModuleService, RoleModuleServiceSchema } from '../../schema/schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
    { name: emailOtp.name, schema: emailOtpSchema },
    { name: smsOtp.name, schema: smsOtpSchema },
    { name: address.name, schema: addressSchema },
    { name: MembershipBuyHistroy.name, schema: MembershipBuyHistroySchema },
    { name: RoleTable.name, schema: RoleTableSchema },
    { name: RoleModuleService.name, schema: RoleModuleServiceSchema },
    
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('users/updateProfile'); // ✅ enable multipart for profile update
  }
}