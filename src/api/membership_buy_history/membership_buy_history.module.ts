// src/modules/membership_management/membership_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipBuyHistroy ,MembershipBuyHistroySchema,MembershipManagement,MembershipManagementSchema, User, UserSchema,Master,MasterSchema} from 'src/schema/schema';
import { MembershipBuyHistroyController } from './membership_buy_history.controller';
import { MembershipBuyHistroyService } from './membership_buy_history.service';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipBuyHistroy.name, schema: MembershipBuyHistroySchema },
      { name: MembershipManagement.name, schema: MembershipManagementSchema },
      { name: User.name, schema: UserSchema },
      { name: Master.name, schema: MasterSchema },
    ]),
  ],
  controllers: [MembershipBuyHistroyController],
  providers: [MembershipBuyHistroyService],
})
export class MembershipBuyManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes(
        'membership_buy_management/add',
        'membership_buy_management/update/:id',
      );
  }
}
