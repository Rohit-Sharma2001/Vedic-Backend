// src/modules/membership_management/membership_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipManagement ,MembershipManagementSchema,YogaVideos,YogaVideosSchema} from 'src/schema/schema';
import { MembershipManagementController } from './membership_management.controller';
import { MembershipManagementService } from './membership_management.service';
import { MulterMiddleware } from '../../middlewares/multer/multer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipManagement.name, schema: MembershipManagementSchema },
      { name: YogaVideos.name, schema: YogaVideosSchema },
    ]),
  ],
  controllers: [MembershipManagementController],
  providers: [MembershipManagementService],
})
export class MembershipManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes(
        'membership_management/add',
        'membership_management/update/:id',
      );
  }
}
