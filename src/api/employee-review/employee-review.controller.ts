// src/modules/employee-review/employee-review.controller.ts
import { Controller, Post, Body, Request, UseInterceptors } from '@nestjs/common';
import { EmployeeReviewService } from './employee-review.service';
import { Base64Interceptor } from 'src/middlewares/Base64Interceptor/Base64Interceptor';
import { Types } from 'mongoose';

@Controller('employee-review')
@UseInterceptors(Base64Interceptor)
export class EmployeeReviewController {
  constructor(private readonly reviewService: EmployeeReviewService) {}

  @Post('add')
  async create(@Request() req: Request, @Body('data') data: string) {
    try {
      const decodedData = Buffer.from(data, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);

      const created = await this.reviewService.create(parsedData);

      return {
        message: 'Employee review submitted successfully!',
        statusCode: 201,
        data: created,
      };
    } catch (error) {
      return {
        message: 'Error submitting review',
        statusCode: 400,
        error: error.message,
      };
    }
  }

  @Post('by-employee')
  async getByEmployee(@Body('data') data: string) {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      const id = parsed.employee_id;

      const { reviews, average } = await this.reviewService.findReviewsByEmployee(id);
      return {
        message: 'Reviews fetched successfully!',
        statusCode: 200,
        average,
        data: reviews,
      };
    } catch (error) {
      return {
        message: 'Error fetching reviews',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('by-user')
  async getByUser(@Body('data') data: string) {
    try {
      const decoded = Buffer.from(data, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      const id = parsed.user_id;

      const result = await this.reviewService.findReviewsByUser(id);
      return {
        message: 'Reviews fetched successfully!',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error fetching reviews',
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post('all')
async getAll() {
  try {
    const reviews = await this.reviewService.getAllReviews();
    return {
      message: 'All employee reviews fetched successfully!',
      statusCode: 200,
      data: reviews,
    };
  } catch (error) {
    return {
      message: 'Error fetching all reviews',
      statusCode: 500,
      error: error.message,
    };
  }
}


  @Post('distribution/all')
async getAllRatingsDistribution() {
  try {
    const result = await this.reviewService.getAllRatingsDistribution();

    return {
      message: 'Ratings distribution fetched successfully!',
      statusCode: 200,
      ...result,
    };
  } catch (error) {
    return {
      message: 'Error fetching distribution',
      statusCode: 500,
      error: error.message,
    };
  }
}

}

