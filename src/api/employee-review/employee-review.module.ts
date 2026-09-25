// src/modules/employee-review/employee-review.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeReview ,EmployeeReviewSchema } from 'src/schema/schema';
import { EmployeeReviewController } from './employee-review.controller';
import { EmployeeReviewService } from './employee-review.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeReview.name, schema: EmployeeReviewSchema, collection: 'employee_reviews' },
    ]),
  ],
  controllers: [EmployeeReviewController],
  providers: [EmployeeReviewService],
})
export class EmployeeReviewModule {}