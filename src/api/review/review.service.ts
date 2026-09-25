// src/modules/review/review.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from 'src/schema/schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<ReviewDocument>,
  ) { }

  async create(data: Partial<Review>): Promise<Review> {
    const entry = new this.reviewModel(data);
    return entry.save();
  }

  async findOneById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const entry = await this.reviewModel.findById(id).exec();
    if (!entry) {
      return {
        message: 'Entry not found',
        statusCode: 404,
      };
    }

    const hostUrl = 'http://localhost:3008';
    const response = entry.toObject() as any;
    response.imageUrl = entry.file ? `${hostUrl}/${entry.file.replace(/\\/g, '/')}` : null;

    return {
      message: 'Entry fetched successfully!',
      statusCode: 200,
      data: response,
    };
  }

  async update(id: string, data: Partial<Review>): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      return {
        message: 'Invalid ObjectId format',
        statusCode: 400,
      };
    }

    const existing = await this.reviewModel.findById(id);
    if (!existing) {
      return {
        message: 'Entry not found',
        statusCode: 404,
      };
    }

    console.log('Existing entry before update:', existing);

    console.log('Data to update:', data);

    // ✅ Properly apply updates including file
    for (const key in data) {
      if (data[key] !== undefined) {
        existing[key] = data[key];
      }
    }

    const saved = await existing.save();
    const hostUrl = 'http://localhost:3008'; // Or your actual base URL

    const result = saved.toObject() as any;
    result.imageUrl = result.file
      ? `${hostUrl}/${result.file.replace(/\\/g, '/')}`
      : null;

    return {
      message: 'Updated successfully',
      statusCode: 200,
      data: result,
    };
  }



}