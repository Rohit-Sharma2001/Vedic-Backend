// src/modules/course_management/course_management.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseManagementController } from './course_management.controller';
import { CourseManagementService } from './course_management.service';
import { CourseManagement, CourseManagementSchema, CourseRating, CourseRatingSchema, CoursesBuyHistroy, CoursesBuyHistroySchema, MembershipBuyHistroy, MembershipBuyHistroySchema, MembershipManagement, MembershipManagementSchema } from 'src/schema/schema';
import { MulterMiddleware } from 'src/middlewares/multer/multer.controller'; // ✅ ADD

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseManagement.name, schema: CourseManagementSchema },
      { name: CourseRating.name, schema: CourseRatingSchema },
      { name: CoursesBuyHistroy.name, schema: CoursesBuyHistroySchema },
      { name: MembershipBuyHistroy.name, schema: MembershipBuyHistroySchema },
      { name: MembershipManagement.name, schema: MembershipManagementSchema },
    ]),
  ],
  controllers: [CourseManagementController],
  providers: [CourseManagementService],
})
export class CourseManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MulterMiddleware)
      .forRoutes('course_management/add', 'course_management/update/:id'); // ✅ Apply file upload middleware
  }
}
