// src/modules/employee-review/employee-review.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeReview } from 'src/schema/schema';

@Injectable()
export class EmployeeReviewService {
  constructor(
    @InjectModel(EmployeeReview.name)
    private reviewModel: Model<EmployeeReview>
  ) {}

  async create(data: Partial<EmployeeReview>): Promise<EmployeeReview> {
    const review = new this.reviewModel(data);
    return review.save();
  }

  async getAllReviews(): Promise<EmployeeReview[]> {
  return this.reviewModel
    .find()
    .populate('user_id', 'name email')
    .populate('employee_id', 'name email') // optional fields based on Employee schema
    .exec();
}


  async findReviewsByEmployee(employeeId: string): Promise<{ reviews: EmployeeReview[]; average: any }> {
    const reviews = await this.reviewModel
      .find({ employee_id: employeeId })
      .populate('user_id', 'name email')
      .exec();

    if (!reviews.length) {
      return { reviews: [], average: null };
    }

    const avg = (field: keyof EmployeeReview) =>
      parseFloat(
        (
          reviews.reduce((sum, r) => sum + (r[field] as number), 0) /
          reviews.length
        ).toFixed(2)
      );

    const average = {
      overall_review: avg('overall_review'),
      punctuality: avg('punctuality'),
      value: avg('value'),
      service: avg('service'),
    };

    return { reviews, average };
  }

  async findReviewsByUser(userId: string): Promise<EmployeeReview[]> {
    return this.reviewModel
      .find({ user_id: new Types.ObjectId(userId) })
      .populate('employee_id')  
      .exec();
  }

  async getAllRatingsDistribution() {
  const reviews = await this.reviewModel.find().exec();

  if (!reviews.length) {
    return {
      average: null,
      totalReviews: 0,
      distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    };
  }

  const avg = (field: keyof EmployeeReview) =>
    parseFloat(
      (
        reviews.reduce((sum, r) => sum + (r[field] as number), 0) /
        reviews.length
      ).toFixed(1)
    );

  const average = {
    overall_review: avg('overall_review'),
    punctuality: avg('punctuality'),
    value: avg('value'),
    service: avg('service'),
  };

  const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  reviews.forEach((r) => {
    const score = Math.round(r.overall_review || 0);
    if (score >= 1 && score <= 5) {
      distribution[score]++;
    }
  });

  return {
    average,
    totalReviews: reviews.length,
    distribution,
  };
}

}